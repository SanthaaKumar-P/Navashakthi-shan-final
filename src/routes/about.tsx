import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { teamMembers, impactStats } from "@/lib/mock-data";
import { Counter } from "@/components/section";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About — NAVSHAKTHI" }, { name: "description", content: "A cultural-first, AI-powered platform for India's 70 lakh rural artisans." }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Our mission" title="Preserve heritage. Empower artisans. Build the future." subtitle="NAVSHAKTHI is built by Team TAARANG for the StartupTN Grand Finale — a marketplace that treats India's craft economy with the dignity it deserves." />
      <section className="container-x py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {impactStats.map((s) => (
            <Reveal key={s.label}>
              <div className="rounded-3xl border border-border/60 bg-card p-6 text-center">
                <div className="font-display text-4xl text-primary"><Counter to={s.value} suffix={s.suffix} /></div>
                <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-mesh-warm">
        <div className="container-x py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl sm:text-4xl">Team TAARANG</h2>
            <p className="mt-4 text-muted-foreground">A cross-disciplinary team of engineers, designers, anthropologists and community organisers.</p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.05}>
                <div className="rounded-3xl border border-border/60 bg-card p-6 flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-cream font-display text-lg">{m.init}</div>
                  <div>
                    <div className="font-display text-lg">{m.name}</div>
                    <div className="text-xs text-muted-foreground">{m.role}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  ),
});
