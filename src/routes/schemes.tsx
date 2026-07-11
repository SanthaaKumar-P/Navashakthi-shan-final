import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { schemes } from "@/lib/mock-data";
import { Landmark, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/schemes")({
  head: () => ({ meta: [{ title: "Government Schemes — NAVSHAKTHI" }, { name: "description", content: "Every artisan scheme, matched, explained and applied — all in one place." }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Government partnerships" title="Every artisan scheme, in one dignified place." subtitle="AI matches artisans to central & state schemes based on their craft, region and eligibility. Then it fills the paperwork." />
      <section className="container-x py-20">
        <div className="grid gap-5 md:grid-cols-2">
          {schemes.map((s, i) => (
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
                  <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-clay">
                    Apply through NAVSHAKTHI <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicPage>
  ),
});
