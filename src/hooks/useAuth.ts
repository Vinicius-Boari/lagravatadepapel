import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  username: string;
  role: AppRole;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega o papel (role) do usuário autenticado a partir da tabela user_roles.
  const loadRole = async (authUser: User | null) => {
    console.log("[useAuth] loadRole starting for:", authUser?.email);
    if (!authUser) {
      setUser(null);
      setRole(null);
      return;
    }

    try {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", authUser.id);

      if (rolesError) {
        console.error("[useAuth] Error fetching roles:", rolesError);
      }

      let resolvedRole: AppRole = null;
      if (roles && roles.length > 0) {
        if (roles.some((r) => r.role === "owner")) resolvedRole = "owner";
        else if (roles.some((r) => r.role === "admin")) resolvedRole = "admin";
      }

      // Hardcoded check for the main owner email as a fallback
      if (!resolvedRole && authUser.email === "viniciusbataglia500@gmail.com") {
        console.log("[useAuth] Applying fallback owner role for:", authUser.email);
        resolvedRole = "owner";
      }

      console.log("[useAuth] Resolved role:", resolvedRole);

      // Fetch profile data to get full_name and latest email
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", authUser.id)
        .maybeSingle();

      const displayName =
        profile?.full_name ||
        (authUser.user_metadata?.full_name as string | undefined) ||
        authUser.email?.split("@")[0] ||
        "Administrador";

      const displayEmail = profile?.email || authUser.email || "";

      setUser({
        id: authUser.id,
        email: displayEmail,
        full_name: displayName,
        username: displayEmail,
        role: resolvedRole,
      });
      setRole(resolvedRole);
    } catch (err) {
      console.error("[useAuth] Critical error in loadRole:", err);
    }
  };

  useEffect(() => {
    // IMPORTANTE: registrar o listener ANTES de chamar getSession (regra do Supabase).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      // Defer Supabase calls para evitar deadlock no callback.
      setTimeout(() => {
        loadRole(newSession?.user ?? null);
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: existing } }) => {
      setSession(existing);
      loadRole(existing?.user ?? null).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInError) {
      setError(signInError.message);
      return false;
    }
    return true;
  };

  const signup = async (email: string, password: string, fullName?: string): Promise<boolean> => {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/admin/dashboard`,
        data: fullName ? { full_name: fullName } : undefined,
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setSession(null);
  };

  const isAdmin = role === "admin" || role === "owner";

  return {
    user,
    role,
    session,
    loading,
    error,
    isOwner: role === "owner",
    isAdmin,
    login,
    signup,
    logout,
  };
}
