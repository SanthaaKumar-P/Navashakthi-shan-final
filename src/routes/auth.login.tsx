import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  head: () => ({ meta: [{ title: "Sign in — NAVSHAKTHI" }] }),
  component: Login,
});

function Login() {
  const [email, setEmail] = useState("artisan@navshakthi.in");
  const [password, setPassword] = useState("demo1234");
  const { login } = useAuth();
  const nav = useNavigate();
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Sign in to your NAVSHAKTHI account."
      footer={<>Don't have an account? <Link to="/auth/signup" className="text-primary font-semibold">Create one</Link></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Signed in — pick your role"); nav({ to: "/auth/role" }); }} className="space-y-4">
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" className="accent-primary" /> Remember me</label>
          <Link to="/auth/forgot" className="text-primary font-medium">Forgot password?</Link>
        </div>
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Sign in</button>
        <div className="relative py-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
          <span className="relative bg-background px-3">or continue with</span>
          <div className="absolute inset-x-0 top-1/2 -z-0 h-px bg-border" />
        </div>
        <button type="button" onClick={() => { login(email, "customer"); nav({ to: "/portal/customer" }); }} className="w-full rounded-full border border-border py-3 text-sm font-medium hover:bg-muted">
          Continue as demo customer
        </button>
      </form>
    </AuthShell>
  );
}

export function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
