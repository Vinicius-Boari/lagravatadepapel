import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { 
  runBackup, 
  restoreBackup, 
  deleteBackup, 
  applyRetentionPolicy, 
  getSignedDownloadUrl 
} from "./backup.server";

// Manual auth check instead of middleware to isolate issues
async function getAuthenticatedUser() {
  // In TanStack Start, we get the request to check headers
  const { getRequest } = await import("@tanstack/react-start/server");
  const request = getRequest();
  const authHeader = request?.headers.get("authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    console.error("[backup.functions] No bearer token");
    throw new Error("Unauthorized: No token");
  }
  
  const token = authHeader.split(" ")[1];
  
  // Create a temporary client for this request
  const { createClient } = await import("@supabase/supabase-js");
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!
  );
  
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    console.error("[backup.functions] Auth error:", error);
    throw new Error("Unauthorized: Invalid token");
  }
  
  return data.user.id;
}

async function assertIsAdmin(userId: string) {
  console.log("[backup.functions] assertIsAdmin for:", userId);
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .in("role", ["admin", "owner"]);
  
  if (error) throw new Error(`Permission error: ${error.message}`);
  if (!data || data.length === 0) throw new Error("Admin/Owner access required");
}

export const listBackups = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      
      const { data: backups, error } = await supabaseAdmin
        .from("backups")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw new Error(error.message);
      return { backups: backups ?? [] };
    } catch (err: any) {
      console.error("[backup.functions] listBackups error:", err.message);
      throw new Error(err.message || "Server Error");
    }
  });

export const getBackupSettings = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      
      const { data: settings, error } = await supabaseAdmin
        .from("backup_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      
      if (error) throw new Error(error.message);
      return { settings };
    } catch (err: any) {
      throw new Error(err.message || "Server Error");
    }
  });

const settingsSchema = z.object({
  auto_enabled: z.boolean(),
  interval_value: z.number().int().min(1).max(10000),
  interval_unit: z.enum(["minutes", "hours", "days"]),
  retention_count: z.number().int().min(1).max(1000),
  retention_days: z.number().int().min(0).max(3650).nullable().optional(),
});

export const updateBackupSettings = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data }) => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      
      const { data: existing } = await supabaseAdmin
        .from("backup_settings")
        .select("id")
        .maybeSingle();

      const settingsData = {
        ...data,
        updated_at: new Date().toISOString(),
        updated_by: userId,
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
      throw new Error(err.message || "Server Error");
    }
  });

export const runBackupNow = createServerFn({ method: "POST" })
  .handler(async () => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      const result = await runBackup({ trigger: "manual", createdBy: userId });
      await applyRetentionPolicy();
      return result;
    } catch (err: any) {
      throw new Error(err.message || "Server Error");
    }
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      await restoreBackup(data.id);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Server Error");
    }
  });

export const deleteBackupFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      await deleteBackup(data.id);
      return { success: true };
    } catch (err: any) {
      throw new Error(err.message || "Server Error");
    }
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    try {
      const userId = await getAuthenticatedUser();
      await assertIsAdmin(userId);
      const { data: row, error } = await supabaseAdmin
        .from("backups")
        .select("file_path")
        .eq("id", data.id)
        .maybeSingle();

      if (error) throw new Error(error.message);
      if (!row?.file_path) throw new Error("Arquivo não encontrado");
      const url = await getSignedDownloadUrl(row.file_path);
      return { url };
    } catch (err: any) {
      throw new Error(err.message || "Server Error");
    }
  });
