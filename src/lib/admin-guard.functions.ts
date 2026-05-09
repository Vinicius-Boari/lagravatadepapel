import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const verifyAdminAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      throw new Response("Forbidden", { status: 403 });
    }

    const roles = (data ?? []).map((r: any) => r.role);
    const isAdmin = roles.includes("owner") || roles.includes("admin");

    if (!isAdmin) {
      throw new Response("Forbidden", { status: 403 });
    }

    return { ok: true as const };
  });
