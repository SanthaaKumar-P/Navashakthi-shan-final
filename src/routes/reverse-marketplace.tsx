import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { MessageSquare, PackagePlus, Users, TrendingUp } from "lucide-react";

const briefs = [
  { buyer: "The Oberoi Group", need: "500 hand-thrown terracotta amenity kits for spa suites", budget: "₹4.5L", region: "Gujarat" },
  { buyer: "Fabindia", need: "Wholesale order — 1,200 Kanchipuram silk scarves", budget: "₹22L", region: "Tamil Nadu" },
  { buyer: "Google India", need: "Diwali gift set — 800 brass diyas with brand engraving", budget: "₹6.4L", region: "Tamil Nadu" },
  { buyer: "Kama Ayurveda", need: "3,000 handwoven jute pouches for gift packaging", budget: "₹2.7L", region: "Assam" },
];

export const Route = createFileRoute("/reverse-marketplace")({
  head: () => ({ meta: [{ title: "Reverse Marketplace — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Reverse marketplace" title="Buyers post. Villages respond." subtitle="Bulk buyers publish briefs. AI matches them to eligible artisan clusters. Communities respond with proposals." />
      <section className="container-x py-20">
        <div className="grid gap-6 lg:grid-cols-2">
          {briefs.map((b, i) => (
            <Reveal key={b.buyer} delay={i * 0.05}>
              <div className="rounded-3xl border border-border/60 bg-card p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">Buyer</div>
                    <div className="mt-1 font-display text-2xl">{b.buyer}</div>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{b.budget}</div>
                </div>
                <p className="mt-5 text-sm leading-relaxed">{b.need}</p>
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> 18 clusters matched</span>
                  <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {b.region}</span>
                  <span className="inline-flex items-center gap-1"><MessageSquare className="h-3 w-3" /> 6 proposals</span>
                </div>
                <button className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
                  <PackagePlus className="h-4 w-4" /> Submit proposal
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </PublicPage>
  ),
});
