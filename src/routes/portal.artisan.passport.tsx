import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GenericSection } from "@/components/portal-sections";
import { CraftPassport, type PassportData } from "@/components/passport/CraftPassport";
import { products } from "@/lib/mock-data";

function toPassport(p: typeof products[number]): PassportData {
  return {
    id: `NVSH-CP-${200000 + parseInt(p.id.slice(1)) * 137}`,
    name: p.name, artisan: p.artisan, village: p.village,
    district: "Verified district", state: p.state, category: p.category,
    handmadeScore: p.authenticity - 2, authenticity: p.authenticity,
    aiStatus: "AI Verified", craftmark: p.craftmark,
    twinId: `0xTW·${p.id.toUpperCase()}·${4000 + parseInt(p.id.slice(1))}A7C2`,
    govStatus: p.giCertified ? "Government approved · GI" : "Government approved",
    date: "12 Jul 2026",
    material: p.materials.join(", "), buildTime: "9 days",
    technique: "Traditional handwork", impact: "Sustainable · natural dyes",
    story: p.story, image: p.image,
  };
}

function Component() {
  const [active, setActive] = useState(products[0].id);
  const current = toPassport(products.find((p) => p.id === active)!);

  return (
    <GenericSection title="Craft Passports" subtitle="Every verified craft carries a printable, blockchain-anchored provenance passport.">
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-2">
          {products.map((p) => (
            <button key={p.id} onClick={() => setActive(p.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${active === p.id ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:bg-muted"}`}>
              <img src={p.image} alt="" className="h-12 w-12 rounded-xl object-cover" />
              <div className="min-w-0"><div className="truncate text-sm font-semibold">{p.name}</div><div className="text-[10px] text-muted-foreground">NVSH-CP-{200000 + parseInt(p.id.slice(1)) * 137}</div></div>
            </button>
          ))}
        </div>
        <CraftPassport data={current} onDownload={() => toast.success("Passport downloaded", { description: current.id })} />
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/passport")({ component: Component });
