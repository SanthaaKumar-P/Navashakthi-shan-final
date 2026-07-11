import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { schemes } from "@/lib/mock-data";
import { Landmark } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/schemes")({
  component: () => (
    <GenericSection title="Government schemes matched for you" subtitle="AI matches you to schemes based on your craft, region and eligibility.">
      <div className="grid gap-4 lg:grid-cols-2">
        {schemes.slice(0, 6).map((s) => (
          <div key={s.code} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Landmark className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-display text-lg">{s.name}</span>
                <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-earth">{s.tag}</span>
              </div>
              <div className="mt-1 text-xs text-primary">{s.benefit}</div>
              <button className="mt-3 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Apply</button>
            </div>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
