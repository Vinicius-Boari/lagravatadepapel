import { createFileRoute } from "@tanstack/react-router";
import {
  runBackup,
  applyRetentionPolicy,
  shouldRunAutoBackup,
  markRunTimestamps,
} from "@/server/backup.server";

// Public cron endpoint. Protected by SUPABASE_SERVICE_ROLE_KEY as bearer token
// because pg_cron runs in the database without a user session.
export const Route = createFileRoute("/api/public/hooks/run-backup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const expected = `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`;
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY || auth !== expected) {
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
