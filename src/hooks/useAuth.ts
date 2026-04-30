import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

// Extreme speed: use localStorage for instant role availability across sessions
const STORAGE_KEY = "lg_user_role";
const getCachedRole = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) as AppRole;
  } catch {
    return null;
  }
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(getCachedRole());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (uid: string) => {
      try {
        // Fast path: if we already have it in state, just clear loading
        if (role && loading) setLoading(false);

        const { data, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        
        if (!mounted) return;
        
        if (roleError) {
          // If schema cache error, we don't block the user if we have a cached role
          console.warn("Role fetch warning:", roleError);
          if (!role) setError(roleError.message);
          setLoading(false);
          return;
        }

        let newRole: AppRole = null;
        if (data && data.length > 0) {
          const roles = data.map(r => r.role);
          if (roles.includes("owner")) newRole = "owner";
          else if (roles.includes("admin")) newRole = "admin";
        }
        
        if (newRole) {
          localStorage.setItem(STORAGE_KEY, newRole);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        
        setRole(newRole);
        setError(null);
      } catch (err) {
        console.error("Auth exception:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      
      if (event === "SIGNED_OUT") {
        localStorage.removeItem(STORAGE_KEY);
        setRole(null);
        setLoading(false);
      } else if (s?.user) {
        fetchRole(s.user.id);
      } else {
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
