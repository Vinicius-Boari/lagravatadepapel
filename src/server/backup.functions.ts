import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idSchema = z.object({ id: z.string().uuid() });
const settingsSchema = z.object({
  auto_enabled: z.boolean(),
  interval_value: z.number().int().min(1).max(10000),
  interval_unit: z.enum(["minutes", "hours", "days"]),
  retention_count: z.number().int().min(1).max(1000),
  retention_days: z.number().int().min(0).max(3650).nullable().optional(),
});

export const listBackups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    console.log("[backup.functions] MINIMAL listBackups started");
    return { backups: [] };
  });

export const getBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return { settings: null };
  });

export const updateBackupSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async () => {
    return { success: true };
  });

export const runBackupNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    return { success: true };
  });

export const restoreBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async () => {
    return { success: true };
  });

export const deleteBackupFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async () => {
    return { success: true };
  });

export const getBackupDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => idSchema.parse(input))
  .handler(async () => {
    return { url: "" };
  });
