import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./auth.login";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/forgot")({
  head: () => ({ meta: [{ title: "Forgot password — NAVSHAKTHI" }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const nav = useNavigate();
  return (
    <AuthShell
      title="Reset your password."
      subtitle="We'll send an OTP to your email or phone."
      footer={<Link to="/auth/login" className="text-primary font-semibold">← Back to sign in</Link>}
    >
      <form onSubmit={(e) => { e.preventDefault(); toast.success("OTP sent"); nav({ to: "/auth/otp" }); }} className="space-y-4">
        <Field label="Email or phone" value={email} onChange={setEmail} placeholder="you@village.in" />
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">Send OTP</button>
      </form>
    </AuthShell>
  );
}
