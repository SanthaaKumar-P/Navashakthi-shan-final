import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { verificationTimeline, officers } from "@/lib/enterprise-data";
import { Stamp, User, ArrowRight } from "lucide-react";

function Page() {
  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Physical verification" title="Government Certification Centre" subtitle="Every craft is physically inspected by trained officers before Craftmark approval — combining human expertise with AI verification." />

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">Workflow</div>
            <h2 className="mt-2 font-display text-3xl">Seven-step certification journey</h2>
          </div>
        </Reveal>

        <ol className="mt-10 relative border-l-2 border-dashed border-primary/30 pl-8">
          {verificationTimeline.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.05}>
              <li className="relative mb-8 last:mb-0">
                <span className="absolute -left-[42px] grid h-8 w-8 place-items-center rounded-full border-2 border-primary bg-background font-display text-sm text-primary">{i + 1}</span>
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="font-display text-lg">{s.step}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{s.detail}</div>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-gradient-to-r from-primary via-primary to-primary/80 p-6 text-primary-foreground">
          <div>
            <div className="font-display text-2xl">Ready to certify your craft?</div>
            <div className="mt-1 text-sm opacity-90">Book a slot with a government officer at your nearest centre.</div>
          </div>
          <Link to="/kiosk-appointment" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-earth">Book verification slot <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <h2 className="font-display text-3xl">Meet our officers</h2>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {officers.map((o, i) => (
              <Reveal key={o.id} delay={i * 0.04}>
                <div className="rounded-2xl border border-border/60 bg-card p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary"><User className="h-5 w-5" /></div>
                    <div>
                      <div className="font-semibold">{o.name}</div>
                      <div className="text-xs text-muted-foreground">{o.role}</div>
                    </div>
                    <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold ${o.status === "Available" ? "bg-emerald-500/15 text-emerald-700" : o.status === "Busy" ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"}`}>{o.status}</span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                    <div><div className="font-display text-lg text-earth">{o.queue}</div><div className="text-muted-foreground">Queue</div></div>
                    <div><div className="font-display text-lg text-earth">{o.completed}</div><div className="text-muted-foreground">Done</div></div>
                    <div><div className="font-display text-lg text-earth">{o.pending}</div><div className="text-muted-foreground">Pending</div></div>
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1 text-xs text-primary"><Stamp className="h-3 w-3" /> Certified reviewer</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/certification-centre")({
  head: () => ({ meta: [{ title: "Government Certification Centre — NAVSHAKTHI" }] }),
  component: Page,
});
