import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { PlayCircle } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/training")({
  component: () => (
    <GenericSection title="Training modules" subtitle="Free NSDC-certified courses in your language.">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Photographing your craft",
          "Fair pricing for handmade",
          "Packing for international shipping",
          "Digital marketing in Tamil",
          "GST for micro-artisans",
          "Storytelling for buyers",
        ].map((t, i) => (
          <div key={t} className="group overflow-hidden rounded-2xl border border-border/60 bg-card">
            <div className="relative aspect-video bg-mesh-forest">
              <PlayCircle className="absolute inset-0 m-auto h-14 w-14 text-cream/80 group-hover:scale-110 transition" />
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground">Module {i + 1} · 22 min</div>
              <div className="mt-1 font-display text-lg">{t}</div>
            </div>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
