import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { products } from "@/lib/mock-data";
export const Route = createFileRoute("/portal/artisan/twin")({
  component: () => (
    <GenericSection title="Digital Twin studio" subtitle="Turn every craft into a 3D digital twin with a blockchain ID.">
      <InfoTiles tiles={[
        { label: "Twins created", value: "6", hint: "Of 8 listings" },
        { label: "Verification passed", value: "6", hint: "100% success" },
        { label: "Blockchain IDs minted", value: "6" },
        { label: "Requests pending", value: "2" },
      ]} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, 6).map((p) => (
          <div key={p.id} className="overflow-hidden rounded-3xl border border-border/60 bg-card">
            <img src={p.image} alt="" className="aspect-video w-full object-cover" />
            <div className="p-4">
              <div className="text-xs text-muted-foreground">Twin ID · 0xTW·{p.id.toUpperCase()}·{4000 + parseInt(p.id.slice(1))}</div>
              <div className="mt-1 font-display text-lg">{p.name}</div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-primary">✓ Verified</span>
                <span className="text-muted-foreground">{p.authenticity}% AI</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
