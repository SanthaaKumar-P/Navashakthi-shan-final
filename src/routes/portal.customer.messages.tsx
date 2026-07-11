import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/portal-shell";

export const Route = createFileRoute("/portal/customer/messages")({
  component: () => (
    <>
      <PageHeader title="Messages" subtitle="Talk directly with artisans about your order or a custom commission." />
      <div className="grid gap-4 rounded-2xl border border-border/60 bg-card p-6">
        {[
          { name: "Selvi Ammal", craft: "Kanchipuram Silk", msg: "Namaskaram — your saree is being packed today. Should ship by 14 Nov.", time: "2h" },
          { name: "Ramesh Sthapati", craft: "Peacock Diya", msg: "Sending you photos of the finish before dispatch.", time: "1d" },
          { name: "Lakshmi Devi", craft: "Warli Vase", msg: "Received your custom pattern brief. Will share sketch by Friday.", time: "3d" },
        ].map((m, i) => (
          <div key={i} className="flex gap-4 rounded-xl bg-background p-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {m.name.split(" ").map((n) => n[0]).slice(0,2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{m.name}</span>
                <span className="text-xs text-muted-foreground">· {m.craft}</span>
                <span className="ml-auto text-xs text-muted-foreground">{m.time}</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{m.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  ),
});
