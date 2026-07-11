import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./auth.login";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({ meta: [{ title: "Create account — NAVSHAKTHI" }] }),
  component: Signup,
});

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const nav = useNavigate();
  return (
    <AuthShell
      title="Join NAVSHAKTHI."
      subtitle="Create your account in seconds."
      footer={<>Already have an account? <Link to="/auth/login" className="text-primary font-semibold">Sign in</Link></>}
    >
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Account created — verify OTP"); nav({ to: "/auth/otp" }); }} className="space-y-4">
        <Field label="Full name" value={name} onChange={setName} placeholder="Meena Bora" />
        <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="you@village.in" />
        <Field label="Password" value={pw} onChange={setPw} type="password" placeholder="At least 8 characters" />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" defaultChecked className="mt-0.5 accent-primary" />
          I agree to the <Link to="/terms" className="text-primary">Terms</Link> & <Link to="/privacy" className="text-primary">Privacy Policy</Link>.
        </label>
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Create account</button>
      </form>
    </AuthShell>
  );
}
