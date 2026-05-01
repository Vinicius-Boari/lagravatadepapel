// Server-only backup service. Uses the admin client to bypass RLS during
// backup/restore operations. Never import from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Tables included in every backup. Order matters for restore (parent → child).
export const BACKUP_TABLES = [
  "site_settings",
  "site_content",
  "site_pages",
  "pages",
  "site_media",
  "instagram_posts",
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];

export interface BackupPayload {
  version: 1;
  created_at: string;
  tables: Record<string, unknown[]>;
}

const BUCKET = "backups";

export async function runBackup(opts: {
  trigger: "manual" | "auto";
  createdBy?: string | null;
}): Promise<{ id: string; size: number; path: string }> {
  // 1) Insert a "processing" row first so the UI can show progress.
  const { data: row, error: insertErr } = await supabaseAdmin
    .from("backups")
    .insert({
      status: "processing",
      trigger: opts.trigger,
      created_by: opts.createdBy ?? null,
    })
    .select("id, created_at")
    .single();

  if (insertErr || !row) {
    throw new Error(`Failed to create backup record: ${insertErr?.message}`);
  }

  try {
    // 2) Snapshot every table.
    const tables: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};
    for (const t of BACKUP_TABLES) {
      const { data, error } = await supabaseAdmin.from(t).select("*");
      if (error) throw new Error(`Erro lendo tabela ${t}: ${error.message}`);
      tables[t] = data ?? [];
      counts[t] = (data ?? []).length;
    }

    const payload: BackupPayload = {
      version: 1,
      created_at: row.created_at,
      tables,
    };
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    const path = `backup-${row.id}.json`;

    // 3) Upload to private storage bucket.
    const { error: uploadErr } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(path, bytes, {
        contentType: "application/json",
        upsert: true,
      });
    if (uploadErr) throw new Error(`Upload falhou: ${uploadErr.message}`);

    // 4) Mark as success.
    const { error: updateErr } = await supabaseAdmin
      .from("backups")
      .update({
        status: "success",
        completed_at: new Date().toISOString(),
        size_bytes: bytes.byteLength,
        file_path: path,
        tables: counts,
      })
      .eq("id", row.id);
    if (updateErr) throw new Error(updateErr.message);

    return { id: row.id, size: bytes.byteLength, path };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("[backup] failed:", message);
    await supabaseAdmin
      .from("backups")
      .update({
        status: "error",
        completed_at: new Date().toISOString(),
        error_message: message,
      })
      .eq("id", row.id);
    throw err;
  }
}

export async function restoreBackup(backupId: string): Promise<void> {
  const { data: backup, error } = await supabaseAdmin
    .from("backups")
    .select("id, status, file_path")
    .eq("id", backupId)
    .maybeSingle();

  if (error) throw new Error(`Erro ao buscar backup: ${error.message}`);
  if (!backup) throw new Error("Backup não encontrado");
  if (backup.status !== "success" || !backup.file_path) {
    throw new Error("Backup inválido ou incompleto");
  }

  const { data: file, error: dlErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .download(backup.file_path);
  if (dlErr || !file) throw new Error(`Falha ao baixar: ${dlErr?.message}`);

  const text = await file.text();
  let payload: BackupPayload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error("Arquivo de backup corrompido (JSON inválido)");
  }
  if (payload.version !== 1 || !payload.tables) {
    throw new Error("Formato de backup não suportado");
  }

  // Destructive restore: clear each table then reinsert.
  // Reverse order to avoid potential FK-like issues, although these tables
  // currently have no FKs.
  const reverseTables = [...BACKUP_TABLES].reverse();
  for (const t of reverseTables) {
    console.log(`[restore] Cleaning table: ${t}`);
    // site_content and site_settings use "key" as PK, not "id".
    const pk = (t === "site_content" || t === "site_settings") ? "key" : "id";
    
    const { error: delErr } = await supabaseAdmin
      .from(t)
      .delete()
      .neq(pk, "_no_match_");
      
    if (delErr) {
      console.error(`[restore] Failed to clean ${t}:`, delErr.message);
      throw new Error(`Erro limpando ${t}: ${delErr.message}`);
    }
  }

  for (const t of BACKUP_TABLES) {
    const rows = payload.tables[t];
    if (!Array.isArray(rows) || rows.length === 0) continue;
    const { error: insErr } = await supabaseAdmin.from(t).insert(rows as never);
    if (insErr) throw new Error(`Erro restaurando ${t}: ${insErr.message}`);
  }
}

export async function deleteBackup(backupId: string): Promise<void> {
  const { data: backup, error } = await supabaseAdmin
    .from("backups")
    .select("file_path")
    .eq("id", backupId)
    .maybeSingle();
  
  if (error) throw new Error(`Erro ao buscar backup para exclusão: ${error.message}`);
  if (!backup) return; // Silently return if already deleted

  if (backup?.file_path) {
    await supabaseAdmin.storage.from(BUCKET).remove([backup.file_path]);
  }
  const { error: delErr } = await supabaseAdmin
    .from("backups")
    .delete()
    .eq("id", backupId);
  if (delErr) throw new Error(delErr.message);
}

function intervalToMs(value: number, unit: string): number {
  const map: Record<string, number> = {
    minutes: 60_000,
    hours: 3_600_000,
    days: 86_400_000,
  };
  return value * (map[unit] ?? 3_600_000);
}

export async function applyRetentionPolicy(): Promise<void> {
  const { data: settings } = await supabaseAdmin
    .from("backup_settings")
    .select("retention_count, retention_days")
    .limit(1)
    .maybeSingle();

  if (!settings) return;

  if (settings.retention_days && settings.retention_days > 0) {
    const cutoff = new Date(
      Date.now() - settings.retention_days * 86_400_000,
    ).toISOString();
    const { data: old } = await supabaseAdmin
      .from("backups")
      .select("id, file_path")
      .lt("created_at", cutoff);
    for (const b of old ?? []) {
      if (b.file_path) {
        await supabaseAdmin.storage.from("backups").remove([b.file_path]);
      }
      await supabaseAdmin.from("backups").delete().eq("id", b.id);
    }
  }

  if (settings.retention_count && settings.retention_count > 0) {
    const { data: all } = await supabaseAdmin
      .from("backups")
      .select("id, file_path")
      .order("created_at", { ascending: false });
    const excess = (all ?? []).slice(settings.retention_count);
    for (const b of excess) {
      if (b.file_path) {
        await supabaseAdmin.storage.from("backups").remove([b.file_path]);
      }
      await supabaseAdmin.from("backups").delete().eq("id", b.id);
    }
  }
}

export async function shouldRunAutoBackup(): Promise<boolean> {
  const { data: settings } = await supabaseAdmin
    .from("backup_settings")
    .select("auto_enabled, interval_value, interval_unit, last_run_at")
    .limit(1)
    .maybeSingle();
  if (!settings || !settings.auto_enabled) return false;
  const intervalMs = intervalToMs(settings.interval_value, settings.interval_unit);
  if (!settings.last_run_at) return true;
  return Date.now() - new Date(settings.last_run_at).getTime() >= intervalMs;
}

export async function markRunTimestamps(): Promise<void> {
  const { data: settings } = await supabaseAdmin
    .from("backup_settings")
    .select("id, interval_value, interval_unit")
    .limit(1)
    .maybeSingle();
  if (!settings) return;
  const intervalMs = intervalToMs(settings.interval_value, settings.interval_unit);
  await supabaseAdmin
    .from("backup_settings")
    .update({
      last_run_at: new Date().toISOString(),
      next_run_at: new Date(Date.now() + intervalMs).toISOString(),
    })
    .eq("id", settings.id);
}

export async function getSignedDownloadUrl(path: string): Promise<string | null> {
  const { data } = await supabaseAdmin.storage
    .from(BUCKET)
    .createSignedUrl(path, 60);
  return data?.signedUrl ?? null;
}
