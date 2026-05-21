/**
 * Administrative Access Guard Functions
 *
 * Server-side functions to verify user roles and permissions.
 * Returns plain serializable objects — never throws Response — so the
 * client never sees "Error: [object Response]".
 */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const verifyAdminAccess = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ ok: boolean; error?: string }> => {
    try {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;

      if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        console.error("[verifyAdminAccess] Missing Supabase env vars");
        return { ok: false, error: "Server misconfigured" };
      }

      const request = getRequest();
      const authHeader = request?.headers?.get("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return { ok: false, error: "Unauthorized" };
      }
      const token = authHeader.slice("Bearer ".length);
      if (!token) return { ok: false, error: "Unauthorized" };

      const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
        global: { headers: { Authorization: `Bearer ${token}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      const { data: userData, error: userErr } = await supabase.auth.getUser(token);
      if (userErr || !userData?.user) {
        return { ok: false, error: "Unauthorized" };
      }
      const userId = userData.user.id;

      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("[verifyAdminAccess] DB error:", error.message);
        return { ok: false, error: "Database error" };
      }

      const roles = (data ?? []).map((r: any) => r.role);
      const isAdmin = roles.includes("owner") || roles.includes("admin");

      if (!isAdmin) {
        return { ok: false, error: "Forbidden" };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("[verifyAdminAccess] Unexpected error:", err?.message || err);
      return { ok: false, error: "Internal server error" };
    }
  },
);
