import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  runBackup,
  restoreBackup,
  deleteBackup,
  applyRetentionPolicy,
  getSignedDownloadUrl,
} from "./backup.server";

// Verifica que o usuário autenticado (via JWT do Supabase) tem papel admin/owner.
async function assertIsAdmin(userId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "owner"]);
    
    if (error) {
      console.error("[assertIsAdmin] Database error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.warn(`[assertIsAdmin] User ${userId} is not an admin/owner`);
      throw new Error("Apenas administradores podem gerenciar backups");
    }
  } catch (err: any) {
    console.error("[assertIsAdmin] Unexpected error:", err);
    throw new Response(err.message || "Unauthorized", { status: 403 });
  }
}

export const listBackups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertIsAdmin(context.userId);
      const { data: backups, error } = await supabaseAdmin
        .from("backups")
        .select("id, created_at, completed_at, status, size_bytes, file_path, trigger, error_message, tables")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw new Error(error.message);
      return { backups: backups ?? [] };
    } catch (err: any) {
      if (err instanceof Response) throw err;
      throw new Response(err.message || "Internal Server Error", { status: 500 });
    }
  });

export const getBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertIsAdmin(context.userId);
    const { data: settings, error } = await supabaseAdmin
      .from("backup_settings")
      .select("id, auto_enabled, interval_value, interval_unit, retention_count, retention_days, last_run_at, next_run_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings };
  });

const settingsSchema = z.object({
  auto_enabled: z.boolean(),
  interval_value: z.number().int().min(1).max(10000),
  interval_unit: z.enum(["minutes", "hours", "days"]),
  retention_count: z.number().int().min(1).max(1000),
  retention_days: z.number().int().min(0).max(3650).nullable().optional(),
});

export const updateBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertIsAdmin(context.userId);
    const { data: existing } = await supabaseAdmin
      .from("backup_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    const settingsData = {
      ...data,
      updated_at: new Date().toISOString(),
      updated_by: context.userId,
    };

    if (existing) {
      const { error } = await supabaseAdmin
        .from("backup_settings")
        .update(settingsData)
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("backup_settings")
        .insert({ ...settingsData, id: crypto.randomUUID() });
      if (error) throw new Error(error.message);
    }
    return { success: true };
  });

export const runBackupNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertIsAdmin(context.userId);
    const result = await runBackup({ trigger: "manual", createdBy: context.userId });
    await applyRetentionPolicy();
    return result;
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertIsAdmin(context.userId);
    await restoreBackup(data.id);
    await supabaseAdmin.from("admin_logs").insert({
      action: "backup.restore",
      user_email: context.userId,
      user_id: context.userId,
      entity_type: "backup",
      entity_id: data.id,
    });
    return { success: true };
  });

export const deleteBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertIsAdmin(context.userId);
    await deleteBackup(data.id);
    return { success: true };
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertIsAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin
      .from("backups")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(`Erro ao buscar arquivo: ${error.message}`);
    if (!row?.file_path) throw new Error("Arquivo indisponível");
    const url = await getSignedDownloadUrl(row.file_path);
    if (!url) throw new Error("Falha ao gerar URL de download");
    return { url };
  });
