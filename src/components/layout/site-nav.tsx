import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShoppingBag, Search, Heart, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/marketplace", label: "Marketplace" },
  { to: "/ai-authentication", label: "AI Verify" },
  { to: "/smart-kiosk-portal", label: "Smart Kiosk" },
  { to: "/training-portal", label: "Training" },
  { to: "/schemes", label: "Schemes" },
  { to: "/about", label: "About" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { count, wishlist } = useCart();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled ? "glass-card border-b border-border/50" : "bg-transparent"
      )}
    >
      <div className="container-x flex h-20 items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="NAVSHAKTHI" width={44} height={44} className="h-11 w-11" />
          <div className="hidden sm:block">
            <div className="font-display text-xl font-semibold tracking-tight text-primary">NAVSHAKTHI</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Culture · Crafts · AI</div>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative rounded-full px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
              activeProps={{ className: "text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Link to="/marketplace" className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <Link to="/portal/customer/wishlist" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Wishlist">
            <Heart className="h-4 w-4" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link to="/portal/customer/cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted" aria-label="Cart">
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link
              to={`/portal/${user!.role}` as any}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <User className="h-4 w-4" />
              {user!.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="hidden sm:inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-warm hover:bg-primary/90"
            >
              Sign in
            </Link>
          )}
          <button
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <div className="container-x flex flex-col gap-1 py-4">
            {nav.map((n) => (
              <Link key={n.to} to={n.to} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
                {n.label}
              </Link>
            ))}
            <Link to="/auth/login" className="mt-2 rounded-full bg-primary px-4 py-3 text-center text-sm font-medium text-primary-foreground">
              Sign in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
