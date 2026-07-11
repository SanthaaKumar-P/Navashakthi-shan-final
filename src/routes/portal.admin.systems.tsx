import { createFileRoute } from "@tanstack/react-router";
import { GenericSection } from "@/components/portal-sections";
import { Cpu } from "lucide-react";
const models = [
  { name: "Vision Authenticity v4.2", status: "Healthy", req: "1.2K/hr", p95: "148ms" },
  { name: "Story LLM v2.1", status: "Healthy", req: "820/hr", p95: "622ms" },
  { name: "Price Fair v3.0", status: "Healthy", req: "540/hr", p95: "72ms" },
  { name: "Twin Renderer v1.3", status: "Watch", req: "60/hr", p95: "8.2s" },
];
export const Route = createFileRoute("/portal/admin/systems")({
  component: () => (
    <GenericSection title="AI systems" subtitle="Health and throughput of NAVSHAKTHI's models.">
      <div className="grid gap-3">
        {models.map((m) => (
          <div key={m.name} className="rounded-2xl border border-border/60 bg-card p-5 flex items-center gap-4">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/10 text-primary"><Cpu className="h-5 w-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-lg">{m.name}</div>
              <div className="text-xs text-muted-foreground">{m.req} · p95 {m.p95}</div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-widest ${m.status === "Healthy" ? "bg-primary/10 text-primary" : "bg-clay/20 text-clay"}`}>{m.status}</span>
          </div>
        ))}
      </div>
    </GenericSection>
  ),
});
