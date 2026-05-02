import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  runBackup,
  applyRetentionPolicy,
  shouldRunAutoBackup,
  markRunTimestamps,
} from "@/server/backup.server";

// Verifica se o JWT do Supabase pertence a um admin/owner.
async function verifySupabaseAdmin(token: string): Promise<boolean> {
  if (!token) return false;
  const url = process.env.SUPABASE_URL;
  const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !pubKey) return false;

  const client = createClient(url, pubKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });

  const { data, error } = await client.auth.getUser(token);
  if (error || !data?.user) return false;

  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id)
    .in("role", ["admin", "owner"]);

  return !!roles && roles.length > 0;
}

// Public cron endpoint. Authorized via service-role key (cron) or admin JWT.
export const Route = createFileRoute("/api/public/hooks/run-backup")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ message: "Use POST to trigger backup" });
      },
      POST: async ({ request }: { request: Request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const apikey = request.headers.get("apikey") ?? "";

        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        const token = auth.replace(/^Bearer\s+/i, "").trim();

        let isAuthorized = false;

        // 1. Cron caller via service role key
        if (serviceKey && (token === serviceKey || apikey === serviceKey)) {
          isAuthorized = true;
        }

        // 2. Admin user via Supabase JWT
        if (!isAuthorized && token) {
          isAuthorized = await verifySupabaseAdmin(token);
        }

        if (!isAuthorized) {
          console.error("[cron] Unauthorized access attempt to run-backup");
          return new Response("Unauthorized", { status: 401 });
        }

        try {
          const should = await shouldRunAutoBackup();
          if (!should) {
            return Response.json({ skipped: true, reason: "interval not reached or disabled" });
          }
          const result = await runBackup({ trigger: "auto", createdBy: null });
          await markRunTimestamps();
          await applyRetentionPolicy();
          return Response.json({ success: true, ...result });
        } catch (err) {
          const message = err instanceof Error ? err.message : "unknown error";
          console.error("[cron run-backup] failed:", message);
          return Response.json({ success: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
