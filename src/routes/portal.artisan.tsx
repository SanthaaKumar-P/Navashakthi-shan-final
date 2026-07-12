import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Package, Upload, Sparkles, ShoppingBag, Wallet, Landmark, GraduationCap, Award, TrendingUp, Globe2, Brain, ShieldCheck, FileBadge, CreditCard } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/artisan", label: "Dashboard", icon: LayoutDashboard },
  { to: "/portal/artisan/products", label: "My Products", icon: Package },
  { to: "/portal/artisan/upload", label: "Upload Craft", icon: Upload },
  { to: "/portal/artisan/authentication", label: "AI Authentication", icon: ShieldCheck },
  { to: "/portal/artisan/passport", label: "Craft Passport", icon: FileBadge },
  { to: "/portal/artisan/nfc", label: "NFC Digital ID", icon: CreditCard },
  { to: "/portal/artisan/twin", label: "Digital Twin", icon: Sparkles },
  { to: "/portal/artisan/orders", label: "Orders", icon: ShoppingBag },
  { to: "/portal/artisan/payments", label: "Payments", icon: Wallet },
  { to: "/portal/artisan/schemes", label: "Govt. Schemes", icon: Landmark },
  { to: "/portal/artisan/training", label: "Training", icon: GraduationCap },
  { to: "/portal/artisan/certificates", label: "Certificates", icon: Award },
  { to: "/portal/artisan/analytics", label: "Analytics", icon: TrendingUp },
  { to: "/portal/artisan/export", label: "Export ready", icon: Globe2 },
  { to: "/portal/artisan/ai", label: "AI Suggestions", icon: Brain },
];

export const Route = createFileRoute("/portal/artisan")({
  head: () => ({ meta: [{ title: "Artisan portal — NAVSHAKTHI" }] }),
  component: () => <PortalShell role="artisan" roleLabel="Artisan portal" nav={nav} accent="clay"><Outlet /></PortalShell>,
});
