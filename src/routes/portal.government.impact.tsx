import { createFileRoute } from "@tanstack/react-router";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
export const Route = createFileRoute("/portal/government/impact")({
  component: () => (
    <GenericSection title="Impact reports" subtitle="Downloadable quarterly reports for the Ministry of Textiles.">
      <InfoTiles tiles={[
        { label: "Wage lift", value: "3.4×", hint: "vs pre-onboarding" },
        { label: "Women-led enterprises", value: "68%" },
        { label: "GI renewals", value: "14" },
        { label: "Export value", value: "₹212 Cr" },
      ]} />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {["Q4 2026 — National impact","Q3 2026 — Southern circle","Q3 2026 — Northeast circle"].map((r) => (
          <div key={r} className="rounded-2xl border border-border/60 bg-card p-6">
            <div className="font-display text-lg">{r}</div>
            <div className="mt-1 text-xs text-muted-foreground">PDF · 4.2MB · 62 pages</div>
            <button className="mt-4 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground">Download</button>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
