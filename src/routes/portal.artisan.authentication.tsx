import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { products } from "@/lib/mock-data";
import { ShieldCheck } from "lucide-react";

function Component() {
  const [scanning, setScanning] = useState<string | null>(null);
  const [done, setDone] = useState<Record<string, boolean>>({ p1: true, p2: true });

  return (
    <GenericSection title="AI Craft Authentication" subtitle="Run the 10-step AI + government pipeline on your listings.">
      <InfoTiles tiles={[
        { label: "Verified", value: String(Object.keys(done).length), hint: "of 8 listings" },
        { label: "Success rate", value: "97.4%" },
        { label: "Pending review", value: "1" },
        { label: "Avg. authenticity", value: "96%" },
      ]} />

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-3">
          {products.slice(0, 5).map((p) => (
            <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
              <img src={p.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.category} · {p.village}</div>
              </div>
              {done[p.id] ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700"><ShieldCheck className="h-3 w-3" /> Verified</span>
              ) : (
                <button
                  onClick={() => { setScanning(p.id); toast("Scan started"); setTimeout(() => { setDone((d) => ({ ...d, [p.id]: true })); setScanning(null); toast.success("Verified", { description: p.name }); }, 6500); }}
                  disabled={!!scanning}
                  className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
                >{scanning === p.id ? "Scanning…" : "Run AI verify"}</button>
              )}
            </div>
          ))}
        </div>
        <ScanPipeline running={!!scanning} />
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/artisan/authentication")({ component: Component });
