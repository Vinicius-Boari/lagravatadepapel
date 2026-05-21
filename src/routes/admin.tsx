import { createFileRoute, useNavigate, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { verifyAdminAccess } from "@/lib/admin-guard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    // Only run on client to avoid SSR issues with auth session in this specific logic
    if (typeof window === "undefined") return;
    
    const isLoginPage = location.pathname === "/admin/login";
    if (isLoginPage) return;

    // Check session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("[admin-route] No session found, redirecting to login");
      throw redirect({ to: "/admin/login" });
    }
    const token = sessionData.session.access_token;

    try {
      // Verify server-side if user is admin
      // Send the token explicitly and also rely on src/start.ts as a global fallback.
      const result = await verifyAdminAccess({
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!result || (typeof result === 'object' && 'ok' in result && !result.ok)) {
        console.warn("[admin-route] Server verification failed: User is not authorized");
        throw redirect({ to: "/admin/login" });
      }
    } catch (err: any) {
      // If it's already a TanStack redirect or TanStack internal error, just let it through
      if (err && (err.status === 301 || err.status === 302 || err.isRedirect || err.name === 'Invariant Violation')) {
        throw err;
      }
      
      console.error("[admin-route] Access verification error:", err?.message || err);
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
      console.warn("[AdminLayout] User authenticated but not admin. Redirecting...");
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-4 text-center px-4">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <div className="space-y-1">
            <p className="text-zinc-100 font-bold uppercase tracking-widest text-sm">Segurança do Painel</p>
            <p className="text-xs text-zinc-500">Autenticando credenciais de acesso...</p>
          </div>
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
