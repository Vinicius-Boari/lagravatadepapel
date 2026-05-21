/**
 * Admin Dashboard Route
 * 
 * Displays the main administrative panel.
 * Access control is handled by router middleware and useAuth hook within the component.
 */
import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return <AdminDashboard />;
}