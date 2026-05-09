import { createFileRoute, useNavigate, Outlet, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { verifyAdminAccess } from "@/lib/admin-guard.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const isLoginPage = location.pathname === "/admin/login";
    if (isLoginPage) return;

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw redirect({ to: "/admin/login" });
    }

    try {
      await verifyAdminAccess();
    } catch (err) {
      throw redirect({ to: "/admin/login" });
    }
  },
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoginPage = window.location.pathname === "/admin/login";
    if (loading) return;
    if (!user && !isLoginPage) {
      navigate({ to: "/admin/login" });
      return;
    }
    if (user && !isAdmin && !isLoginPage) {
      navigate({ to: "/admin/login" });
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Carregando...
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
