import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRole = async (uid: string) => {
      try {
        const { data, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", uid);
        
        if (!mounted) return;
        
        if (roleError) {
          console.error("Error fetching role:", roleError);
          setError(roleError.message);
          return;
        }

        if (data && data.length > 0) {
          const owner = data.find((r) => r.role === "owner");
          setRole(owner ? "owner" : (data[0].role as AppRole));
        } else {
          setRole(null);
        }
      } catch (err) {
        console.error("Exception fetching role:", err);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // Defer to avoid deadlocks
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setRole(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) fetchRole(s.user.id);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, user, role, loading, error, isOwner: role === "owner", isAdmin: role === "admin" || role === "owner" };
}
