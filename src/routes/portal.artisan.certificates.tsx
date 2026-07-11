import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { Award } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/certificates")({
  component: () => (
    <GenericSection title="Certificates" subtitle="Every recognition, digitally verified.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Craftmark 2026", "PM Vishwakarma", "GI Kanchipuram Silk", "NSDC Photography L1", "MSME Udyam"].map((c) => (
          <div key={c} className="rounded-3xl border border-border/60 bg-card p-6 text-center">
            <Award className="mx-auto h-10 w-10 text-gold" />
            <div className="mt-4 font-display text-lg">{c}</div>
            <div className="mt-1 text-xs text-muted-foreground">Verified · 2026</div>
            <button className="mt-4 rounded-full border border-border px-4 py-1.5 text-xs">Download PDF</button>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
