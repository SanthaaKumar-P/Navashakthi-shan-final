import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
const logs = [
  "13:42 · admin@navshakthi.in approved listing M-8271",
  "13:38 · System: Twin Renderer scaled from 4 to 8 pods",
  "13:30 · rahul.sharma@gov.in exported Impact Report Q4",
  "13:21 · Scheme rule updated: PM Vishwakarma tier-2 ceiling +₹50,000",
  "13:04 · Auto-verification pass: 12 crafts moved to Live",
];
export const Route = createFileRoute("/portal/admin/logs")({
  component: () => (
    <GenericSection title="Audit logs" subtitle="Every change, immutable and timestamped.">
      <div className="rounded-2xl border border-border/60 bg-card p-6 font-mono text-xs leading-loose text-muted-foreground">
        {logs.map((l) => <div key={l}>{l}</div>)}
      </div>
    </GenericSection>
  ),
});
