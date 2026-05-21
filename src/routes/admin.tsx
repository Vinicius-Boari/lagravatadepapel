import { createFileRoute, useNavigate, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { verifyAdminAccess } from "@/lib/admin-guard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // Only run on client to avoid SSR issues with auth session
    if (typeof window === "undefined") return;
    
    const isLoginPage = location.pathname === "/admin/login";
    if (isLoginPage) return;

    // Check session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("[admin-route] No session found, redirecting to login");
      throw redirect({ to: "/admin/login" });
    }

    try {
      // Verify server-side if user is admin
      await verifyAdminAccess();
    } catch (err: any) {
      console.error("[admin-route] Access verification failed:", err);
      // If it's a redirect/response from verifyAdminAccess, re-throw it
      if (err instanceof Response || (err && err.status)) {
        throw redirect({ to: "/admin/login" });
      }
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    const isLoginPage = window.location.pathname === "/admin/login";
    if (isLoginPage) return;

    if (!user) {
      navigate({ to: "/admin/login" });
      return;
    }
    
    if (!isAdmin) {
      console.warn("[AdminLayout] User is authenticated but not an admin. Redirecting...");
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <span>Verificando acesso...</span>
        </div>
      </div>
    );
  }

  const isLoginPage = typeof window !== "undefined" && window.location.pathname === "/admin/login";
  if (!user && !isLoginPage) return null;
  if (user && !isAdmin && !isLoginPage) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Outlet />
    </div>
  );
}
