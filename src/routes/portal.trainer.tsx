import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, BookOpen, CalendarClock, Award } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/trainer", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/trainer/courses", label: "My courses", icon: BookOpen },
  { to: "/portal/trainer/slots", label: "Slots", icon: CalendarClock },
  { to: "/portal/trainer/certificates", label: "Certificates", icon: Award },
];

export const Route = createFileRoute("/portal/trainer")({
  head: () => ({ meta: [{ title: "Trainer portal — NAVSHAKTHI" }] }),
  component: () => <PortalShell role={"trainer" as any} roleLabel="Trainer portal" nav={nav} accent="gold"><Outlet /></PortalShell>,
});
