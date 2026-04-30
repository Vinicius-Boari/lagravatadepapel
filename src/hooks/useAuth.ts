import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

const STORAGE_KEY = "lg_user_role";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null); // Start clean to avoid cache loops
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (uid: string) => {
      try {
        // Clear previous error
        setError(null);

        const { data, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        
        if (!mounted) return;
        
        if (roleError) {
          console.error("Auth role error:", roleError);
          // If we have a cached role in storage, use it as fallback during DB issues
          const cached = localStorage.getItem(STORAGE_KEY);
          if (cached) {
            setRole(cached as AppRole);
          } else {
            setError(roleError.message);
          }
          setLoading(false);
          return;
        }

        let newRole: AppRole = null;
        if (data && data.length > 0) {
          const roles = data.map(r => r.role);
          // Prioritize owner
          if (roles.includes("owner")) newRole = "owner";
          else if (roles.includes("admin")) newRole = "admin";
        }
        
        if (newRole) {
          localStorage.setItem(STORAGE_KEY, newRole);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        
        setRole(newRole);
      } catch (err) {
        console.error("Auth exception:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Listen for auth changes
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

    // Initial session check
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