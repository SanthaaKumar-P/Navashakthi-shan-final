import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import village from "@/assets/village.jpg";

const clusters = [
  { name: "Kanchipuram silk cluster", state: "Tamil Nadu", artisans: 4820, health: "Excellent" },
  { name: "Bhuj pottery cluster", state: "Gujarat", artisans: 1240, health: "Good" },
  { name: "Majuli bamboo weavers", state: "Assam", artisans: 620, health: "Watch" },
  { name: "Channapatna toys", state: "Karnataka", artisans: 890, health: "Good" },
  { name: "Jaipur blue pottery", state: "Rajasthan", artisans: 1560, health: "Excellent" },
];

export const Route = createFileRoute("/portal/government/clusters")({
  component: () => (
    <GenericSection title="Cluster map" subtitle="Live health across 47 recognised artisan clusters.">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {clusters.map((c) => (
            <div key={c.name} className="rounded-2xl border border-border/60 bg-card p-5 flex items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-display text-lg truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.state} · {c.artisans.toLocaleString("en-IN")} artisans</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${c.health === "Excellent" ? "bg-primary/10 text-primary" : c.health === "Good" ? "bg-gold/20 text-earth" : "bg-clay/20 text-clay"}`}>{c.health}</span>
            </div>
          ))}
        </div>
        <div className="rounded-3xl overflow-hidden border border-border/60 relative h-96 lg:h-full">
          <img src={village} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-earth/30" />
          <div className="absolute bottom-6 left-6 text-cream">
            <div className="font-display text-2xl">47 clusters</div>
            <div className="text-sm text-cream/80">across 9 states</div>
          </div>
        </div>
      </div>
    </GenericSection>
  ),
});
