import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Brain, Camera, Languages, Search, Sparkles, LineChart } from "lucide-react";
import { Reveal } from "@/components/section";

const features = [
  { icon: Camera, title: "Vision Authenticity", desc: "CNN-based scoring for handmade vs machine — trained on 84,000+ verified crafts." },
  { icon: Languages, title: "Multilingual Storytelling", desc: "Auto-generates craft stories in English + 11 Indian languages, in the artisan's own voice." },
  { icon: Search, title: "Visual Search", desc: "Upload a photo, find the closest handmade Indian craft with matching artisan." },
  { icon: Sparkles, title: "Fair Pricing Engine", desc: "Recommends prices that respect craft time, materials, and buyer segment." },
  { icon: Brain, title: "Scheme Matcher", desc: "Matches every artisan to eligible central + state government schemes automatically." },
  { icon: LineChart, title: "Demand Forecasting", desc: "Predicts festival + gifting demand 90 days ahead, per craft, per region." },
];

export const Route = createFileRoute("/ai-features")({
  head: () => ({ meta: [{ title: "AI Features — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="AI, in service of craft" title="AI that respects the maker." subtitle="Six proprietary models — from vision to language to pricing — designed with artisans, not just for them." />
      <section className="container-x py-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <Reveal key={f.title} delay={i * 0.04}>
            <div className="rounded-3xl border border-border/60 bg-card p-8 h-full">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-clay/15 text-clay"><f.icon className="h-6 w-6" /></div>
              <h3 className="mt-5 font-display text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </PublicPage>
  ),
});
