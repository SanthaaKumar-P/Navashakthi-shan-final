import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { Sparkles } from "lucide-react";
export const Route = createFileRoute("/portal/artisan/ai")({
  component: () => (
    <GenericSection title="AI suggestions" subtitle="Personalised growth prompts, updated every morning.">
      <div className="space-y-4">
        {[
          "Add 3 more silk sarees before Diwali — demand up 240% in Metros.",
          "Your pottery photos would score 22% higher with natural morning light. Watch the 3-min guide.",
          "Buyers in USA are searching for 'Warli wall art' — you have adjacent skills. Try a small collection.",
          "Kanchipuram GI application is 92% complete. Add proof of loom purchase to finish.",
          "You qualify for a ₹2,50,000 Mudra Kishor loan at 8.5% — pre-approved through PM Vishwakarma.",
        ].map((s) => (
          <div key={s} className="flex gap-4 rounded-2xl border border-border/60 bg-card p-5">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/20 text-earth"><Sparkles className="h-4 w-4" /></div>
            <div className="flex-1 text-sm">{s}</div>
            <button className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground shrink-0">Act on it</button>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
