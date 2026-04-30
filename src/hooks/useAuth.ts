import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

// Cache roles in memory to speed up navigation/reloads
let cachedRole: AppRole = null;
let cachedUid: string | null = null;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(cachedRole);
  const [loading, setLoading] = useState(!cachedRole);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (uid: string) => {
      if (cachedUid === uid && cachedRole) {
        setRole(cachedRole);
        setLoading(false);
        return;
      }

      try {
        const { data, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        
        if (!mounted) return;
        
        if (roleError) {
          setError(roleError.message);
          setLoading(false);
          return;
        }

        let newRole: AppRole = null;
        if (data && data.length > 0) {
          const roles = data.map(r => r.role);
          if (roles.includes("owner")) newRole = "owner";
          else if (roles.includes("admin")) newRole = "admin";
        }
        
        cachedRole = newRole;
        cachedUid = uid;
        setRole(newRole);
      } catch (err) {
        console.error("Auth error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchRole(s.user.id);
      } else {
        cachedRole = null;
        cachedUid = null;
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchRole(s.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = role === "admin" || role === "owner";

  return { 
    session, 
    user, 
    role, 
    loading, 
    error, 
    isOwner: role === "owner", 
    isAdmin 
  };
}
