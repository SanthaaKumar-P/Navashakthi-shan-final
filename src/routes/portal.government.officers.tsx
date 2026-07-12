import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { GenericSection, InfoTiles } from "@/components/portal-sections";
import { officers } from "@/lib/enterprise-data";
import { User, Ticket } from "lucide-react";

function Component() {
  return (
    <GenericSection title="Officer slot management" subtitle="Live queue, token generation and inspection assignments.">
      <InfoTiles tiles={[
        { label: "Officers on duty", value: "4" },
        { label: "Live queue", value: String(officers.reduce((s, o) => s + o.queue, 0)) },
        { label: "Completed today", value: "42" },
        { label: "Avg. wait", value: "18 min" },
      ]} />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {officers.map((o) => (
          <div key={o.id} className="rounded-3xl border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
              <div>
                <div className="font-semibold">{o.name}</div>
                <div className="text-xs text-muted-foreground">{o.role}</div>
              </div>
              <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.status === "Available" ? "bg-emerald-500/15 text-emerald-700" : o.status === "Busy" ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"}`}>{o.status}</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-xl bg-muted/40 p-2"><div className="font-display text-xl text-earth">{o.queue}</div><div className="text-muted-foreground">Queue</div></div>
              <div className="rounded-xl bg-muted/40 p-2"><div className="font-display text-xl text-earth">{o.completed}</div><div className="text-muted-foreground">Done</div></div>
              <div className="rounded-xl bg-muted/40 p-2"><div className="font-display text-xl text-earth">{o.pending}</div><div className="text-muted-foreground">Pending</div></div>
            </div>
            <button onClick={() => toast.success(`Token generated for ${o.name}`, { description: `T-${Math.floor(1000 + Math.random() * 9000)}` })} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">
              <Ticket className="h-3.5 w-3.5" /> Generate token
            </button>
          </div>
        ))}
      </div>
    </GenericSection>
  );
}

export const Route = createFileRoute("/portal/government/officers")({ component: Component });
