import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  runBackup,
  restoreBackup,
  deleteBackup,
  applyRetentionPolicy,
  getSignedDownloadUrl,
} from "./backup.server";

async function verifyCustomAdmin(token: string) {
  if (!token) throw new Error("Token de autenticação ausente");
  if (!token.startsWith("session-")) throw new Error("Token inválido");
  
  const userId = token.replace("session-", "");
  const { data: user, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (error || !user) throw new Error("Administrador não encontrado");
  if (user.role !== "owner" && user.role !== "admin") {
    throw new Error("Apenas administradores podem gerenciar backups");
  }
  return user;
}

export const listBackups = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ adminToken: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await verifyCustomAdmin(data.adminToken);
    const { data: backups, error } = await supabaseAdmin
      .from("backups")
      .select("id, created_at, completed_at, status, size_bytes, file_path, trigger, error_message, tables")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { backups: backups ?? [] };
  });

export const getBackupSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ adminToken: z.string() }).parse(input))
  .handler(async ({ data }) => {
    await verifyCustomAdmin(data.adminToken);
    const { data: settings, error } = await supabaseAdmin
      .from("backup_settings")
      .select("id, auto_enabled, interval_value, interval_unit, retention_count, retention_days, last_run_at, next_run_at")
      .limit(1)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return { settings };
  });

const settingsSchema = z.object({
  adminToken: z.string(),
  data: z.object({
    auto_enabled: z.boolean(),
    interval_value: z.number().int().min(1).max(10000),
    interval_unit: z.enum(["minutes", "hours", "days"]),
    retention_count: z.number().int().min(1).max(1000),
    retention_days: z.number().int().min(0).max(3650).nullable().optional(),
  }),
});

export const updateBackupSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data }) => {
    const user = await verifyCustomAdmin(data.adminToken);
    const { data: existing } = await supabaseAdmin
      .from("backup_settings")
      .select("id")
      .limit(1)
      .maybeSingle();
    
    const settingsData = {
      ...data.data,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
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
  .inputValidator((input: unknown) => z.object({ adminToken: z.string() }).parse(input))
  .handler(async ({ data }) => {
    const user = await verifyCustomAdmin(data.adminToken);
    const result = await runBackup({ trigger: "manual", createdBy: user.id });
    await applyRetentionPolicy();
    return result;
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ adminToken: z.string(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const user = await verifyCustomAdmin(data.adminToken);
    await restoreBackup(data.id);
    await supabaseAdmin.from("admin_logs").insert({
      action: "backup.restore",
      user_email: user.id,
      user_id: user.id,
      entity_type: "backup",
      entity_id: data.id,
    });
    return { success: true };
  });

export const deleteBackupFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ adminToken: z.string(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await verifyCustomAdmin(data.adminToken);
    await deleteBackup(data.id);
    return { success: true };
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ adminToken: z.string(), id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    await verifyCustomAdmin(data.adminToken);
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
