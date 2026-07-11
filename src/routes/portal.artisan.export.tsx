import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { Globe2 } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/export")({
  component: () => (
    <GenericSection title="Export-ready" subtitle="Get global-ready with documentation, packaging and India Post international support.">
      <div className="rounded-3xl bg-mesh-forest p-10 text-cream">
        <Globe2 className="h-10 w-10 text-gold" />
        <h2 className="mt-4 font-display text-3xl">Your crafts are export-ready in 3 steps.</h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {["Register with DGFT (IEC code)","Craftmark + GI validation","India Post international parcel"].map((s, i) => (
            <li key={s} className="rounded-2xl bg-white/5 p-5 border border-cream/10">
              <div className="font-display text-2xl text-gold">0{i+1}</div>
              <div className="mt-2 text-sm">{s}</div>
            </li>
          ))}
        </ol>
      </div>
    </GenericSection>
  ),
});
