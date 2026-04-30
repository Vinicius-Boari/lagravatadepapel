import { createAPIFileRoute } from "@tanstack/react-start/api";
import {
  runBackup,
  applyRetentionPolicy,
  shouldRunAutoBackup,
  markRunTimestamps,
} from "@/server/backup.server";

export const Route = createAPIFileRoute("/api/public/hooks/run-backup")({
  GET: async ({ request }) => {
    return Response.json({ message: "Use POST to trigger backup" });
  },
  POST: async ({ request }) => {
    const auth = request.headers.get("authorization") ?? "";
    const apikey = request.headers.get("apikey") ?? "";
    
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const pubKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
    
    const token = auth.replace(/^Bearer\s+/i, "");
    
    const isAuthorized = 
      (serviceKey && (token === serviceKey || apikey === serviceKey)) ||
      (pubKey && (token === pubKey || apikey === pubKey));

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
});
