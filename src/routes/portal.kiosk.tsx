import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, CalendarClock, Wrench, Users } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/kiosk", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/kiosk/appointments", label: "Appointments", icon: CalendarClock },
  { to: "/portal/kiosk/services", label: "Services", icon: Wrench },
  { to: "/portal/kiosk/artisans", label: "Artisans helped", icon: Users },
];

export const Route = createFileRoute("/portal/kiosk")({
  head: () => ({ meta: [{ title: "Kiosk operator — NAVSHAKTHI" }] }),
  component: () => <PortalShell role={"kiosk" as any} roleLabel="Kiosk operator" nav={nav} accent="primary"><Outlet /></PortalShell>,
});
