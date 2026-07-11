import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, Hammer, Landmark, ShieldCheck } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth, type Role } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/role")({
  head: () => ({ meta: [{ title: "Pick your portal — NAVSHAKTHI" }] }),
  component: RolePick,
});

const roles: Array<{ id: Role; title: string; desc: string; icon: any; to: string }> = [
  { id: "customer", title: "Customer", desc: "Discover, wishlist and buy verified crafts.", icon: ShoppingBag, to: "/portal/customer" },
  { id: "artisan", title: "Artisan", desc: "List crafts, generate digital twins, receive payments.", icon: Hammer, to: "/portal/artisan" },
  { id: "government", title: "Government officer", desc: "Approve schemes, monitor villages, export reports.", icon: Landmark, to: "/portal/government" },
  { id: "admin", title: "Platform admin", desc: "Manage the entire NAVSHAKTHI ecosystem.", icon: ShieldCheck, to: "/portal/admin" },
];

function RolePick() {
  const { login, user } = useAuth();
  const nav = useNavigate();
  return (
    <AuthShell title="Choose your portal." subtitle="You can switch roles anytime from your profile.">
      <div className="grid gap-3">
        {roles.map((r) => (
          <button
            key={r.id}
            onClick={() => {
              if (!user) login("demo@navshakthi.in", r.id);
              else login(user.email, r.id);
              toast.success(`Signed in as ${r.title}`);
              nav({ to: r.to as any });
            }}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left transition hover:border-primary hover:shadow-warm"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <r.icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-lg">{r.title}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </div>
            <span className="text-muted-foreground group-hover:text-primary">→</span>
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
