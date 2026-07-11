import { createFileRoute } from "@tanstack/react-router";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { Cuboid, Fingerprint, ScanLine, ShieldCheck } from "lucide-react";
import { products } from "@/lib/mock-data";

export const Route = createFileRoute("/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — NAVSHAKTHI" }, { name: "description", content: "3D digital twins with blockchain-anchored provenance for every craft." }] }),
  component: () => (
    <PublicPage>
      <PageHero eyebrow="Digital Twin Technology" title="Every craft, a 3D twin with a soul." subtitle="Photogrammetry + neural rendering + on-chain provenance. From a single smartphone scan to a fully interactive 3D twin — with an immutable authenticity certificate." />

      <section className="container-x py-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: ScanLine, title: "Scan", desc: "Village artisan scans craft with a phone in 60 seconds." },
            { icon: Cuboid, title: "Render", desc: "Neural photogrammetry builds a 3D twin, ready to spin, zoom & AR-view." },
            { icon: Fingerprint, title: "Fingerprint", desc: "AI extracts a unique material + weave signature — impossible to fake." },
            { icon: ShieldCheck, title: "Anchor", desc: "The fingerprint is hashed to a public blockchain — instant provenance." },
          ].map((c, i) => (
            <Reveal key={c.title} delay={i * 0.05}>
              <div className="rounded-3xl border border-border/60 bg-card p-6">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="h-6 w-6" /></div>
                <h3 className="mt-5 font-display text-xl">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-mesh-forest text-cream">
        <div className="container-x py-20">
          <h2 className="font-display text-3xl sm:text-4xl">Recently twinned crafts</h2>
          <p className="mt-3 max-w-2xl text-cream/70">Each one carries an on-chain ID buyers can verify anywhere in the world.</p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.filter(p => p.digitalTwin).slice(0, 4).map((p) => (
              <div key={p.id} className="overflow-hidden rounded-3xl bg-white/5 border border-cream/10 backdrop-blur">
                <img src={p.image} alt="" className="aspect-square w-full object-cover" />
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest text-gold">Twin · 0xTW·{p.id.toUpperCase()}·{4000 + parseInt(p.id.slice(1))}</div>
                  <div className="mt-2 font-display text-lg">{p.name}</div>
                  <div className="mt-2 text-xs text-cream/60">{p.artisan} · {p.village}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  ),
});
