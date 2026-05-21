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

async function assertIsAdmin(userId: string) {
  
  if (!userId) {
    console.error("[backup.functions] assertIsAdmin: No userId provided");
    throw new Error("Usuário não identificado");
  }
  
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  
  if (error) {
    console.error("[backup.functions] assertIsAdmin database error:", error);
    throw new Error(`Erro de permissão: ${error.message}`);
  }
  
  const roles = data?.map(r => r.role) || [];
  
  
  const isAdmin = roles.some(role => ["admin", "owner"].includes(role));
  
  if (!isAdmin) {
    console.warn(`[backup.functions] assertIsAdmin: User ${userId} is not an admin/owner. Roles:`, roles);
    throw new Error("Apenas administradores podem gerenciar backups");
  }
}

export const listBackups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      if (!context.userId) throw new Error("Usuário não identificado");
      await assertIsAdmin(context.userId);
      
      const { data: backups, error } = await supabaseAdmin
        .from("backups")
        .select("id, created_at, completed_at, status, size_bytes, file_path, trigger, error_message, tables")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("[backup.functions] listBackups database error:", error.message);
        return { ok: false, error: error.message };
      }
      
      return { ok: true, backups: backups ?? [] };
    } catch (err: any) {
      console.error("[backup.functions] listBackups caught error:", err.message);
      return { ok: false, error: err.message };
    }
  });

export const getBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    
    try {
      await assertIsAdmin(context.userId);
      
      const { data: settings, error } = await supabaseAdmin
        .from("backup_settings")
        .select("id, auto_enabled, interval_value, interval_unit, retention_count, retention_days, last_run_at, next_run_at, backup_type, bucket_name, backup_path")
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error("[backup.functions] getBackupSettings database error:", error.message);
        throw new Error(`Erro ao buscar configurações: ${error.message}`);
      }
      
      
      return { settings };
    } catch (err: any) {
      console.error("[backup.functions] getBackupSettings caught error:", err.message);
      throw err;
    }
  });

const settingsSchema = z.object({
  auto_enabled: z.boolean(),
  interval_value: z.number().int().min(1).max(10000),
  interval_unit: z.enum(["minutes", "hours", "days"]),
  retention_count: z.number().int().min(1).max(1000),
  retention_days: z.number().int().min(0).max(3650).nullable().optional(),
  backup_type: z.string().optional(),
  bucket_name: z.string().optional(),
  backup_path: z.string().optional(),
});


export const updateBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    try {
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
    } catch (err: any) {
      console.error("[backup.functions] updateBackupSettings error:", err.message);
      throw new Error(err.message || "Internal Server Error");
    }
  });

export const runBackupNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      await assertIsAdmin(context.userId);
      const result = await runBackup({ trigger: "manual", createdBy: context.userId });
      await applyRetentionPolicy();
      return result;
    } catch (err: any) {
      console.error("[backup.functions] runBackupNow error:", err.message);
      throw new Error(err.message || "Internal Server Error");
    }
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
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
    } catch (err: any) {
      console.error("[backup.functions] restoreBackupFn error:", err.message);
      throw new Error(err.message || "Internal Server Error");
    }
  });

export const deleteBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
      await assertIsAdmin(context.userId);
      await deleteBackup(data.id);
      return { success: true };
    } catch (err: any) {
      console.error("[backup.functions] deleteBackupFn error:", err.message);
      throw new Error(err.message || "Internal Server Error");
    }
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    try {
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
    } catch (err: any) {
      console.error("[backup.functions] getBackupDownloadUrl error:", err.message);
      throw new Error(err.message || "Internal Server Error");
    }
  });
