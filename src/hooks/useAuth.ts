import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AppRole = "owner" | "admin" | null;

const STORAGE_KEY = "lg_user_role";
const AUTH_TOKEN_KEY = "lg_auth_token";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AppRole;
}

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(() => {
    try {
      const cached = localStorage.getItem("lg_admin_user");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [role, setRole] = useState<AppRole>(() => user?.role ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Basic check for session on mount
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    // In a real app we would verify the token with the server
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      // Custom auth logic as requested
      const { data, error: dbError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", email)
        .eq("password_hash", password) // User provided password as hash for simplicity in this specific request
        .single();

      if (dbError || !data) {
        return false;
      }

      const adminUser: AdminUser = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role as AppRole,
      };

      setUser(adminUser);
      setRole(adminUser.role);
      localStorage.setItem("lg_admin_user", JSON.stringify(adminUser));
      localStorage.setItem(AUTH_TOKEN_KEY, "fake-jwt-token-" + data.id); // Simple session management
      
      // Log login
      await supabase.from("admin_logs").insert({
        user_id: data.id,
        user_email: data.email,
        action: "login",
        entity_type: "user",
        entity_id: data.id
      });

      return true;
    } catch (err) {
      console.error("Login exception:", err);
      setError("Erro ao conectar com o servidor.");
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