import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import village from "@/assets/village.jpg";

const stories = [
  { village: "Bhuj, Gujarat", artisans: 42, weeks: 8, quote: "The women potters of Bhuj told us they had never seen their name printed on their work. That changed everything about the product we built." },
  { village: "Majuli, Assam", artisans: 26, weeks: 6, quote: "River-island bamboo weavers walked us through 200-year-old techniques their grandmothers still teach at dawn." },
  { village: "Kanchipuram, Tamil Nadu", artisans: 58, weeks: 10, quote: "We sat at pit-looms for 12 hours to understand a single Kanchipuram silk saree. Then we built AI that respects that time." },
  { village: "Channapatna, Karnataka", artisans: 34, weeks: 5, quote: "Toy-makers here worried digital-first would break their craft. We spent a month proving it could protect it instead." },
];

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "Field Research — NAVSHAKTHI" }, { name: "description", content: "160+ artisan interviews across 47 villages in 9 states." }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Field research" title="160 interviews. 47 villages. 9 states." subtitle="Every feature of NAVSHAKTHI is grounded in months of listening — at looms, kilns, and kitchen tables across rural India." image={village} />
      <section className="container-x py-20">
        <div className="grid gap-8 lg:grid-cols-2">
          {stories.map((s, i) => (
            <Reveal key={s.village} delay={i * 0.05}>
              <div className="rounded-3xl border border-border/60 bg-card p-8">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-display text-2xl">{s.village}</h3>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">{s.weeks} weeks · {s.artisans} artisans</span>
                </div>
                <p className="mt-6 border-l-2 border-gold pl-4 text-base italic leading-relaxed text-foreground/80">"{s.quote}"</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-earth text-cream">
        <div className="container-x py-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="text-xs uppercase tracking-[0.3em] text-gold">The principle</div>
            <p className="mt-6 font-display text-3xl leading-tight sm:text-4xl">
              "No feature ships until three artisans in three different villages ask for it."
            </p>
            <p className="mt-4 text-cream/60">— Team TAARANG field research charter</p>
          </div>
        </div>
      </section>
    </PublicPage>
  ),
});
