import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { schemes } from "@/lib/mock-data";
import { Landmark, ArrowUpRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type Status = "idle" | "applying" | "applied";

function Page() {
  const [status, setStatus] = useState<Record<string, Status>>({});

  const apply = (code: string, name: string) => {
    if (status[code] && status[code] !== "idle") return;
    setStatus((s) => ({ ...s, [code]: "applying" }));
    toast.loading(`Preparing your ${name} application…`, { id: code });
    setTimeout(() => {
      setStatus((s) => ({ ...s, [code]: "applied" }));
      const ref = `NS-${code}-${Math.floor(1000 + Math.random() * 8999)}`;
      toast.success(`Application started for ${name}`, {
        id: code,
        description: `Reference ID ${ref}. NAVSHAKTHI has pre-filled your artisan profile and documents.`,
      });
    }, 1400);
  };

  return (
    <PublicPage>
      <PageHero eyebrow="Government partnerships" title="Every artisan scheme, in one dignified place." subtitle="AI matches artisans to central & state schemes based on their craft, region and eligibility. Then it fills the paperwork." />
      <section className="container-x py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {schemes.map((s, i) => {
            const st = status[s.code] ?? "idle";
            return (
              <Reveal key={s.code} delay={i * 0.03}>
                <div className="group flex gap-5 rounded-3xl border border-border/60 bg-card p-6 transition hover:shadow-elegant">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                    <Landmark className="h-6 w-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl">{s.name}</h3>
                      <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-earth">{s.tag}</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-primary">{s.benefit}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                    <button
                      onClick={() => apply(s.code, s.name)}
                      disabled={st !== "idle"}
                      className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-clay transition hover:text-clay/80 disabled:opacity-70"
                    >
                      {st === "applying" && <Loader2 className="h-4 w-4 animate-spin" />}
                      {st === "applied" && <Check className="h-4 w-4" />}
                      {st === "applied" ? "Application started" : st === "applying" ? "Applying…" : "Apply through NAVSHAKTHI"}
                      {st === "idle" && <ArrowUpRight className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Schemes — NAVSHAKTHI" }, { name: "description", content: "Every artisan scheme, matched, explained and applied — all in one place." }] }),
  component: Page,
});
