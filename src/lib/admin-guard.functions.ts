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
 * 
 * CRITICAL: We return a plain object instead of throwing or returning Response objects
 * to avoid client-side TanStack Start serialization errors.
 */
export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    
    if (!userId) {
      console.error("[verifyAdminAccess] No userId found in context");
      return { ok: false, error: "Unauthorized" };
    }

    try {
      // Fetch user roles using service role to ensure we can read permissions
      const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("[verifyAdminAccess] DB error:", error.message);
        return { ok: false, error: "Database error" };
      }

      // Determine if the user has required privileges
      const roles = (data ?? []).map((r: any) => r.role);
      const isAdmin = roles.includes("owner") || roles.includes("admin");

      if (!isAdmin) {
        console.warn(`[verifyAdminAccess] Unauthorized access attempt by user: ${userId}. Roles: ${roles.join(', ')}`);
        return { ok: false, error: "Forbidden" };
      }

      return { ok: true };
    } catch (err: any) {
      console.error("[verifyAdminAccess] Unexpected error:", err?.message || err);
      return { ok: false, error: "Internal server error" };
    }
  });
