import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LayoutDashboard, Heart, ShoppingBag, Package, User, MapPin, MessageSquare, Gift, Bell, Mic } from "lucide-react";
import { PortalShell, type NavItem } from "@/components/portal-shell";

const nav: NavItem[] = [
  { to: "/portal/customer", label: "Overview", icon: LayoutDashboard },
  { to: "/portal/customer/orders", label: "My Orders", icon: Package },
  { to: "/portal/customer/wishlist", label: "Wishlist", icon: Heart },
  { to: "/portal/customer/cart", label: "Cart", icon: ShoppingBag },
  { to: "/portal/customer/messages", label: "Messages", icon: MessageSquare },
  { to: "/portal/customer/addresses", label: "Addresses", icon: MapPin },
  { to: "/portal/customer/notifications", label: "Notifications", icon: Bell },
  { to: "/portal/customer/gifts", label: "Gift orders", icon: Gift },
  { to: "/portal/customer/voice", label: "Voice search", icon: Mic },
  { to: "/portal/customer/profile", label: "Profile", icon: User },
];

export const Route = createFileRoute("/portal/customer")({
  head: () => ({ meta: [{ title: "My account — NAVSHAKTHI" }] }),
  component: () => <PortalShell role="customer" roleLabel="Customer portal" nav={nav}><Outlet /></PortalShell>,
});
