import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminDashboard = lazy(() => import("@/components/admin/AdminDashboard").then(m => ({ default: m.AdminDashboard })));

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-500">Carregando dashboard...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}