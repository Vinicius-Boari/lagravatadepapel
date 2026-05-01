import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "owner" | "admin" | null;

const AUTH_TOKEN_KEY = "lg_auth_token";

export interface AdminUser {
  id: string;
  username: string;
  full_name: string;
  role: AppRole;
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const cached = localStorage.getItem("lg_admin_user");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [role, setRole] = useState<AppRole>(() => user?.role ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      const cleanUsername = username.trim();
      const cleanPassword = password.trim();

      console.log("[Auth] Attempting login for:", cleanUsername);

      // Check for hardcoded owner credentials as requested
      if (cleanUsername === "Vinicius" && cleanPassword === "280405") {
        const ownerUser: AdminUser = {
          id: "00000000-0000-0000-0000-000000000001",
          username: "Vinicius",
          full_name: "Vinicius Bataglia",
          role: "owner",
        };
        setUser(ownerUser);
        setRole("owner");
        localStorage.setItem("lg_admin_user", JSON.stringify(ownerUser));
        localStorage.setItem(AUTH_TOKEN_KEY, "session-owner-vinicius");
        return true;
      }

      // Fallback to database check for other admins
      const { data, error: dbError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", cleanUsername);

      if (dbError) {
        console.error("Database error during login:", dbError);
        // If DB fails, only owner can log in via hardcoded credentials above
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      const dbUser = data[0];
      
      if (dbUser.password_hash !== cleanPassword) {
        return false;
      }

      const adminUser: AdminUser = {
        id: dbUser.id,
        username: dbUser.username,
        full_name: dbUser.full_name,
        role: dbUser.role as AppRole,
      };

      setUser(adminUser);
      setRole(adminUser.role);
      localStorage.setItem("lg_admin_user", JSON.stringify(adminUser));
      localStorage.setItem(AUTH_TOKEN_KEY, "session-" + dbUser.id);
      
      return true;
    } catch (err) {
      console.error("Login exception:", err);
      setError("Erro ao realizar login.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("lg_admin_user");
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const isAdmin = role === "admin" || role === "owner";

  return { 
    user, 
    role, 
    loading, 
    error, 
    isOwner: role === "owner", 
    isAdmin,
    login,
    logout
  };
}