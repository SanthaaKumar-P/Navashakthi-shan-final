import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/portal-shell";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/portal/customer/profile")({
  component: () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const handleSignOut = () => {
      logout();
      toast.success("Signed out successfully");
      navigate({ to: "/" });
    };
    return (
      <>
        <PageHeader title="Profile" subtitle="Manage your NAVSHAKTHI identity." />
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-border/60 bg-card p-6 text-center">
            <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-primary/10 font-display text-3xl text-primary">
              {(user?.name || "N").split(" ").map((n) => n[0]).slice(0,2).join("")}
            </div>
            <div className="mt-4 font-display text-xl">{user?.name ?? "Guest"}</div>
            <div className="text-xs text-muted-foreground">{user?.email}</div>
            <button onClick={handleSignOut} className="mt-6 w-full rounded-full border border-border py-2 text-sm hover:bg-muted transition">Sign out</button>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Full name", val: user?.name ?? "—" },
                { label: "Email", val: user?.email ?? "—" },
                { label: "Role", val: user?.role ?? "customer" },
                { label: "Language", val: "English · தமிழ்" },
                { label: "Preferred category", val: "Textiles" },
                { label: "Member since", val: "Nov 2026" },
              ].map((f) => (
                <div key={f.label}>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{f.label}</div>
                  <div className="mt-1 text-sm">{f.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  },
});
