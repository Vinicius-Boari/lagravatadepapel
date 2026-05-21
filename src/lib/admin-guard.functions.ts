/**
 * Administrative Access Guard Functions
 * 
 * Server-side functions to verify user roles and permissions.
 * Prevents unauthorized access to administrative features.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * verifyAdminAccess
 * Middleware-protected server function that checks if the authenticated user
 * has 'owner' or 'admin' roles in the user_roles table.
 * Returns { ok: true } on success or throws a 403 Forbidden response.
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    
    if (!userId) {
      console.error("[verifyAdminAccess] No userId found in context");
      throw new Response("Unauthorized", { status: 401 });
    }

    try {
      // Fetch user roles using service role to ensure we can read permissions
      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("[verifyAdminAccess] DB error:", error);
        throw new Response("Internal Server Error", { status: 500 });
      }

      // Determine if the user has required privileges
      const roles = (data ?? []).map((r: any) => r.role);
      const isAdmin = roles.includes("owner") || roles.includes("admin");

      if (!isAdmin) {
        console.warn(`[verifyAdminAccess] Unauthorized access attempt by user: ${userId}. Roles: ${roles.join(', ')}`);
        throw new Response("Forbidden", { status: 403 });
      }

      return { ok: true as const };
    } catch (err: any) {
      if (err instanceof Response) throw err;
      console.error("[verifyAdminAccess] Unexpected error:", err);
      throw new Response("Forbidden", { status: 403 });
    }
  });
