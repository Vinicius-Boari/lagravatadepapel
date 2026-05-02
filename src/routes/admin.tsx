import { createFileRoute, useNavigate, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const isLoginPage = window.location.pathname === "/admin/login";
    if (loading) return;

    // Sem sessão → redireciona para login
    if (!user && !isLoginPage) {
      navigate({ to: "/admin/login" });
      return;
    }
    // Sessão sem papel de admin → também redireciona (impede usuários comuns)
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
