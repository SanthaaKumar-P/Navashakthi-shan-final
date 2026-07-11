import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { MapPin, Wifi, Camera, CreditCard } from "lucide-react";

export const Route = createFileRoute("/kiosk")({
  head: () => ({ meta: [{ title: "Smart Kiosks — NAVSHAKTHI" }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Smart Kiosks" title="A NAVSHAKTHI kiosk in every panchayat." subtitle="Solar-powered kiosks with a scanning turntable, a touchscreen, an AI assistant, and India Post pickup — installed at the village post office." />
      <section className="container-x py-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Camera, title: "360° Scan booth", desc: "Photogrammetry-grade capture in one minute." },
          { icon: Wifi, title: "Offline-first", desc: "Works on 2G; syncs when connectivity returns." },
          { icon: CreditCard, title: "Aadhaar KYC", desc: "One-tap registration with biometric verification." },
          { icon: MapPin, title: "1,240 villages", desc: "Live in 9 states, expanding to every district by 2027." },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 0.05}>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-6 w-6" /></div>
              <h3 className="mt-4 font-display text-xl">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </section>
    </PublicPage>
  ),
});
