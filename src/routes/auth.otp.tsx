import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/auth-shell";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/otp")({
  head: () => ({ meta: [{ title: "Verify OTP — NAVSHAKTHI" }] }),
  component: OTP,
});

function OTP() {
  const [otp, setOtp] = useState("");
  const nav = useNavigate();
  return (
    <AuthShell title="Verify it's you." subtitle="Enter the 6-digit code we sent you.">
      <form onSubmit={(e) => { e.preventDefault(); if (otp.length < 6) return toast.error("Enter 6 digits"); toast.success("Verified"); nav({ to: "/auth/reset" }); }} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <button className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground">Verify</button>
        <button type="button" className="w-full text-sm text-muted-foreground hover:text-primary">Resend code in 42s</button>
      </form>
    </AuthShell>
  );
}
