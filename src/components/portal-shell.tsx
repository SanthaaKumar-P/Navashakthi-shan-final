import { Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, type ComponentType, type ReactNode } from "react";
import { Bell, ChevronRight, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo.png";
import { useAuth, type Role } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export interface NavItem { to: string; label: string; icon: ComponentType<any> }

export function PortalShell({
  role, roleLabel, nav, accent = "primary", children,
}: {
  role: Role; roleLabel: string; nav: NavItem[]; accent?: "primary" | "clay" | "gold"; children?: ReactNode;
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const accentBg = accent === "clay" ? "bg-accent" : accent === "gold" ? "bg-gold" : "bg-primary";
  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-border/60 bg-sidebar lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border/60 px-6">
          <img src={logo} alt="" className="h-10 w-10" />
          <div>
            <div className="font-display text-lg text-primary">NAVSHAKTHI</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{roleLabel}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== `/portal/${role}` && pathname.startsWith(n.to));
            return (
              <Link
                key={n.to}
                to={n.to as any}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? `${accentBg} text-white` : "text-foreground/70 hover:bg-muted hover:text-foreground"
                )}
              >
                <n.icon className="h-4 w-4" />
                <span className="flex-1">{n.label}</span>
                {active && <ChevronRight className="h-4 w-4 opacity-70" />}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-background p-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {(user?.name || "N").split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{user?.name ?? "Guest"}</div>
              <div className="truncate text-[11px] text-muted-foreground">{user?.email ?? roleLabel}</div>
            </div>
            <button onClick={handleLogout} title="Sign out" className="grid h-8 w-8 place-items-center rounded-full hover:bg-muted">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur sm:px-8">
          <Link to="/" className="lg:hidden inline-flex items-center gap-2 font-display text-primary">
            <img src={logo} alt="" className="h-8 w-8" /> NAVSHAKTHI
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"><Bell className="h-4 w-4" /></button>
            <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted"><Settings className="h-4 w-4" /></button>
          </div>
        </header>
        <main className="p-4 sm:p-8">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-3xl text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-clay">{hint}</div>}
    </div>
  );
}

export function useRoleGuard(role: Role) {
  const { user, isAuthenticated } = useAuth();
  useEffect(() => {
    if (!isAuthenticated) return;
    if (user && user.role !== role) {
      // soft warn, don't force logout in demo
    }
  }, [user, isAuthenticated, role]);
}

export const requireAuth = () => {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem("navshakthi_user");
    if (!raw) throw redirect({ to: "/auth/login" });
  } catch {}
};
