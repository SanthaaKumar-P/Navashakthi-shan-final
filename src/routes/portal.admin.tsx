import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Users, ShieldAlert, Package, Flag, Server, FileText } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/admin", label: "Command centre", icon: LayoutDashboard },
  { to: "/portal/admin/users", label: "Users", icon: Users },
  { to: "/portal/admin/moderation", label: "Moderation", icon: ShieldAlert },
  { to: "/portal/admin/catalog", label: "Catalog", icon: Package },
  { to: "/portal/admin/reports", label: "Reports", icon: Flag },
  { to: "/portal/admin/systems", label: "AI systems", icon: Server },
  { to: "/portal/admin/logs", label: "Audit logs", icon: FileText },
];

export const Route = createFileRoute("/portal/admin")({
  head: () => ({ meta: [{ title: "Admin — NAVSHAKTHI" }] }),
  component: () => <PortalShell role="admin" roleLabel="Admin console" nav={nav}><Outlet /></PortalShell>,
});
