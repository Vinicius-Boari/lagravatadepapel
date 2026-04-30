// Bootstrap the owner account. Idempotent: safe to call multiple times.
// SECURITY: Requires BOOTSTRAP_TOKEN header. Credentials read from secrets only.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-bootstrap-token",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require a one-time bootstrap token to prevent unauthenticated owner takeover.
    const expectedToken = Deno.env.get("BOOTSTRAP_TOKEN");
    const providedToken = req.headers.get("x-bootstrap-token");
    if (!expectedToken || providedToken !== expectedToken) {
      return new Response(
        JSON.stringify({ error: "Forbidden" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const OWNER_EMAIL = Deno.env.get("BOOTSTRAP_OWNER_EMAIL");
    const OWNER_PASSWORD = Deno.env.get("BOOTSTRAP_OWNER_PASSWORD");
    if (!OWNER_EMAIL || !OWNER_PASSWORD) {
      return new Response(
        JSON.stringify({ error: "Owner credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: existingOwner } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "owner")
      .maybeSingle();

    if (existingOwner) {
      return new Response(
        JSON.stringify({ status: "already_exists", message: "Dono já configurado" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: list } = await supabase.auth.admin.listUsers();
    let user = list?.users?.find((u) => u.email === OWNER_EMAIL);

    if (!user) {
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: OWNER_EMAIL,
        password: OWNER_PASSWORD,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      user = created.user!;
    }

    await supabase.from("user_roles").delete().eq("user_id", user.id);
    const { error: roleErr } = await supabase
      .from("user_roles")
      .insert({ user_id: user.id, role: "owner" });
    if (roleErr) throw roleErr;

    await supabase
      .from("profiles")
      .upsert({ id: user.id, email: user.email! }, { onConflict: "id" });

    return new Response(
      JSON.stringify({ status: "ok", user_id: user.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("bootstrap-owner error:", e);
    return new Response(
      JSON.stringify({ status: "error", message: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
