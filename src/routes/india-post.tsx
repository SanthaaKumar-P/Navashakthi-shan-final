import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { Truck, MapPin, PackageCheck, Globe2 } from "lucide-react";

const steps = [
  { label: "Village pickup", desc: "India Post postman collects from the artisan's home.", icon: Truck },
  { label: "District hub", desc: "Consolidation + Craftmark verification at the postal circle.", icon: MapPin },
  { label: "Dispatch", desc: "Speed Post domestic · International EMS for global orders.", icon: PackageCheck },
  { label: "Delivered", desc: "Doorstep delivery in 14,000+ pin codes across the world.", icon: Globe2 },
];

export const Route = createFileRoute("/india-post")({
  head: () => ({ meta: [{ title: "India Post logistics — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Logistics partner" title="From village pickup to global doorstep." subtitle="Powered by India's largest postal network — 1.5 lakh post offices, one dignified pipeline for handmade India." />
      <section className="container-x py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.05}>
              <div className="relative rounded-3xl border border-border/60 bg-card p-6">
                <div className="absolute top-4 right-6 font-display text-5xl text-gold/20">0{i + 1}</div>
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="h-6 w-6" /></div>
                <h3 className="mt-5 font-display text-xl">{s.label}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="bg-mesh-forest text-cream">
        <div className="container-x py-20 text-center">
          <div className="font-display text-5xl text-gold">14,000+</div>
          <p className="mt-3 text-cream/80">international pin codes reachable through India Post EMS partnership</p>
        </div>
      </section>
    </PublicPage>
  ),
});
