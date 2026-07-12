import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Landmark, MapPin, GraduationCap, ShieldCheck, Users, TrendingUp, Stamp, UserCog } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/government", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/government/certification", label: "Certification centre", icon: Stamp },
  { to: "/portal/government/officers", label: "Officers", icon: UserCog },
  { to: "/portal/government/schemes", label: "Schemes admin", icon: Landmark },
  { to: "/portal/government/clusters", label: "Clusters map", icon: MapPin },
  { to: "/portal/government/training", label: "Training", icon: GraduationCap },
  { to: "/portal/government/gi", label: "GI & Craftmark", icon: ShieldCheck },
  { to: "/portal/government/artisans", label: "Artisans", icon: Users },
  { to: "/portal/government/impact", label: "Impact reports", icon: TrendingUp },
];

export const Route = createFileRoute("/portal/government")({
  head: () => ({ meta: [{ title: "Government portal — NAVSHAKTHI" }] }),
  component: () => <PortalShell role="government" roleLabel="Government portal" nav={nav} accent="gold"><Outlet /></PortalShell>,
});
