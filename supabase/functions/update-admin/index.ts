// Update an admin account (email and/or password). Only callable by the Owner.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: ownerCheck } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "owner")
      .maybeSingle();

    if (!ownerCheck) {
      return new Response(JSON.stringify({ error: "Apenas o Dono pode editar administradores" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const targetId = String(body.user_id ?? "");
    const email = body.email ? String(body.email).trim().toLowerCase() : undefined;
    const password = body.password ? String(body.password) : undefined;

    if (!targetId) {
      return new Response(JSON.stringify({ error: "user_id obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const updates: Record<string, unknown> = {};
    if (email) {
      if (!email.includes("@") || email.length > 255) {
        return new Response(JSON.stringify({ error: "Email inválido" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      updates.email = email;
      updates.email_confirm = true;
    }
    if (password !== undefined) {
      if (password.length < 6 || password.length > 128) {
        return new Response(JSON.stringify({ error: "Senha deve ter entre 6 e 128 caracteres" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      updates.password = password;
    }

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: "Nada para atualizar" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: updErr } = await admin.auth.admin.updateUserById(targetId, updates);
    if (updErr) {
      return new Response(JSON.stringify({ error: updErr.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (email) {
      await admin.from("profiles").update({ email, updated_at: new Date().toISOString() }).eq("id", targetId);
    }

    return new Response(JSON.stringify({ status: "ok" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("update-admin error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
