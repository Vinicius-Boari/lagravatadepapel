import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  runBackup,
  applyRetentionPolicy,
  shouldRunAutoBackup,
  markRunTimestamps,
} from "@/server/backup.server";

async function verifyCustomAdmin(token: string) {
  if (!token) return null;
  if (!token.startsWith("session-")) return null;
  
  const userId = token.replace("session-", "");
  const { data: user, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (error || !user) return null;
  if (user.role !== "owner" && user.role !== "admin") return null;
  return user;
}

// Public cron endpoint. Protected by SUPABASE_SERVICE_ROLE_KEY, PUBLISHABLE_KEY OR Admin Login
export const Route = createFileRoute("/api/public/hooks/run-backup")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({ message: "Use POST to trigger backup" });
      },
      POST: async ({ request }: { request: Request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const apikey = request.headers.get("apikey") ?? "";
        
        // Try multiple possible env var names for keys
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
        const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
        
        const token = auth.replace(/^Bearer\s+/i, "");
        
        let isAuthorized = 
          (serviceKey && (token === serviceKey || apikey === serviceKey)) ||
          (pubKey && (token === pubKey || apikey === pubKey));

        if (!isAuthorized && token) {
          const user = await verifyCustomAdmin(token);
          if (user) {
            isAuthorized = true;
          }
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
