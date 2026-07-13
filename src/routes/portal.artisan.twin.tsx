import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { TwinViewer } from "@/components/twin/TwinViewer";
import { products } from "@/lib/mock-data";

function Page() {
  const list = products.slice(0, 6);
  const [active, setActive] = useState(list[0]);
  return (
    <GenericSection title="Digital Twin studio" subtitle="Turn every craft into a 3D digital twin with a blockchain ID.">
      <InfoTiles tiles={[
        { label: "Twins created", value: "6", hint: "Of 8 listings" },
        { label: "Verification passed", value: "6", hint: "100% success" },
        { label: "Blockchain IDs minted", value: "6" },
        { label: "Requests pending", value: "2" },
      ]} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <TwinViewer
          src={active.image}
          alt={active.name}
          twinId={`0xTW·${active.id.toUpperCase()}·${4000 + parseInt(active.id.slice(1))}`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`overflow-hidden rounded-2xl border bg-card text-left transition hover:-translate-y-0.5 ${active.id === p.id ? "border-primary shadow-elegant" : "border-border/60"}`}
            >
              <img src={p.image} alt="" className="aspect-video w-full object-cover" />
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Twin ID · 0xTW·{p.id.toUpperCase()}·{4000 + parseInt(p.id.slice(1))}</div>
                <div className="mt-1 font-display text-base">{p.name}</div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-primary">✓ Verified</span>
                  <span className="text-muted-foreground">{p.authenticity}% AI</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/twin")({
  component: Page,
});
