import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  runBackup,
  restoreBackup,
  deleteBackup,
  applyRetentionPolicy,
  getSignedDownloadUrl,
} from "./backup.server";

async function assertAdmin(supabase: ReturnType<typeof requireAdminClient>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error("Falha ao verificar permissões");
  const roles = new Set((data ?? []).map((r) => r.role));
  if (!roles.has("owner") && !roles.has("admin")) {
    throw new Error("Apenas administradores podem gerenciar backups");
  }
}
type SupaClient = Parameters<typeof assertAdmin>[0];
function requireAdminClient(c: SupaClient) {
  return c;
}

export const listBackups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("backups")
      .select("id, created_at, completed_at, status, size_bytes, file_path, trigger, error_message, tables")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { backups: data ?? [] };
  });

export const getBackupSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("backup_settings")
      .select("id, auto_enabled, interval_value, interval_unit, retention_count, retention_days, last_run_at, next_run_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings: data };
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
    await assertAdmin(context.supabase, context.userId);
    const { data: existing } = await supabaseAdmin
      .from("backup_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (existing) {
      const { error } = await supabaseAdmin
        .from("backup_settings")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          updated_by: context.userId,
        })
        .eq("id", existing.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin
        .from("backup_settings")
        .insert({ ...data, updated_by: context.userId });
      if (error) throw new Error(error.message);
    }
    return { success: true };
  });

export const runBackupNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const result = await runBackup({ trigger: "manual", createdBy: context.userId });
    await applyRetentionPolicy();
    return result;
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    await restoreBackup(data.id);
    await supabaseAdmin.from("admin_logs").insert({
      action: "backup.restore",
      user_email: context.claims?.email ?? "",
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
    await assertAdmin(context.supabase, context.userId);
    await deleteBackup(data.id);
    return { success: true };
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data: row } = await supabaseAdmin
      .from("backups")
      .select("file_path")
      .eq("id", data.id)
      .single();
    if (!row?.file_path) throw new Error("Arquivo indisponível");
    const url = await getSignedDownloadUrl(row.file_path);
    if (!url) throw new Error("Falha ao gerar URL de download");
    return { url };
  });
