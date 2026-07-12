import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { courses } from "@/lib/enterprise-data";
import { Clock, Users, Languages, BadgeCheck } from "lucide-react";

function Page() {
  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Learn" title="Learn Traditional Crafts" subtitle="Government-sponsored workshops taught by master artisans across pottery, wood, metal, handloom, jewellery, stone, temple arts, bamboo, painting and embroidery." />

      <section className="container-x py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.04}>
              <div className="h-full overflow-hidden rounded-3xl border border-border/60 bg-card transition hover:-translate-y-1 hover:shadow-elegant">
                <div className="grid h-40 place-items-center bg-gradient-to-br from-primary/10 via-gold/20 to-clay/10 text-6xl">{c.image}</div>
                <div className="p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">{c.craft}</span>
                    {c.sponsored && <span className="inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold text-earth"><BadgeCheck className="h-2.5 w-2.5" /> Govt. sponsored</span>}
                  </div>
                  <div className="mt-3 font-display text-xl">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">by {c.trainer}</div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {c.duration}</span>
                    <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {c.seats} seats</span>
                    <span className="inline-flex items-center gap-1"><Languages className="h-3 w-3" /> {c.language}</span>
                  </div>
                  <div className="mt-2 text-[11px] font-semibold text-clay">Level · {c.level}</div>

                  <Link to="/workshop-booking" className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground">Enroll now</Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/training-portal")({
  head: () => ({ meta: [{ title: "Training Portal — NAVSHAKTHI" }] }),
  component: Page,
});
