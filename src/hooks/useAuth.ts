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

      // Fetch profile data to get full_name and latest email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", authUser.id)
        .maybeSingle();

      if (profileError) {
        console.warn("[useAuth] Profile fetch error:", profileError);
      }

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
    } catch (err: any) {
      console.error("[useAuth] Critical error in loadRole:", err?.message || err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      // Defer calls para evitar deadlock
      setTimeout(() => {
        if (isMounted) loadRole(newSession?.user ?? null);
      }, 0);
    });

    // Carga inicial
    const initSession = async () => {
      try {
        const { data: { session: existing } } = await supabase.auth.getSession();
        if (isMounted) {
          setSession(existing);
          await loadRole(existing?.user ?? null);
        }
      } catch (err) {
        console.error("[useAuth] Session init error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return false;
      }
      return true;
    } catch (err: any) {
      setError(err?.message || "Erro inesperado no servidor de login.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setSession(null);
    } catch (err) {
      console.error("[useAuth] Sign out error:", err);
      // Forçar limpeza local mesmo se o servidor falhar
      setUser(null);
      setRole(null);
      setSession(null);
    }
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
    logout,
  };
}
