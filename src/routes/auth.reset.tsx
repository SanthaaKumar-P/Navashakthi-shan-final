import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { Field } from "./auth.login";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({ meta: [{ title: "New password — NAVSHAKTHI" }] }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const nav = useNavigate();
  return (
    <AuthShell title="Set a new password." subtitle="Choose something you'll remember.">
      <form onSubmit={(e) => { e.preventDefault(); if (pw !== pw2) return toast.error("Passwords don't match"); toast.success("Password updated"); nav({ to: "/auth/role" }); }} className="space-y-4">
        <Field label="New password" value={pw} onChange={setPw} type="password" />
        <Field label="Confirm password" value={pw2} onChange={setPw2} type="password" />
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">Update password</button>
      </form>
    </AuthShell>
  );
}
