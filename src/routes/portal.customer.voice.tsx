import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";
import { Mic } from "lucide-react";

export const Route = createFileRoute("/portal/customer/voice")({
  component: () => (
    <>
      <PageHeader title="Voice search" subtitle="Ask NAVSHAKTHI in any Indian language — Tamil, Hindi, Kannada, Bengali and more." />
      <div className="grid place-items-center rounded-3xl bg-mesh-forest py-20 text-cream">
        <button className="grid h-32 w-32 place-items-center rounded-full bg-gold text-earth shadow-warm hover:scale-105 transition">
          <Mic className="h-12 w-12" />
        </button>
        <div className="mt-6 font-display text-2xl">"Tamil ல் Kanchipuram pattu saree காட்டு"</div>
        <div className="mt-2 text-cream/60 text-sm">Tap and speak — we'll match crafts, artisans and villages</div>
      </div>
    </>
  ),
});
