import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { TwinViewer } from "@/components/twin/TwinViewer";
import { Cuboid, Fingerprint, ScanLine, ShieldCheck } from "lucide-react";
import { products } from "@/lib/mock-data";

function Page() {
  const twinned = products.filter((p) => p.digitalTwin);
  const [active, setActive] = useState(twinned[0] ?? products[0]);

  return (
    <PublicPage>
      <PageHero eyebrow="Digital Twin Technology" title="Every craft, a 3D twin with a soul." subtitle="Photogrammetry + neural rendering + on-chain provenance. From a single smartphone scan to a fully interactive 3D twin — with an immutable authenticity certificate." />

      <section className="container-x py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <TwinViewer
              src={active.image}
              alt={active.name}
              twinId={`0xTW·${active.id.toUpperCase()}·${4000 + parseInt(active.id.slice(1))}`}
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Now viewing</div>
              <h2 className="mt-2 font-display text-3xl text-earth">{active.name}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{active.artisan} · {active.village}, {active.state}</p>
              <p className="mt-6 text-sm leading-relaxed text-foreground/80">{active.story}</p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Authenticity</div>
                  <div className="mt-1 font-display text-2xl text-primary">{active.authenticity}%</div>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card p-4">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">On-chain</div>
                  <div className="mt-1 font-mono text-xs text-earth">0xTW·{active.id.toUpperCase()}·{4000 + parseInt(active.id.slice(1))}</div>
                </div>
              </div>

              <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
                {twinned.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActive(p)}
                    className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${active.id === p.id ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"}`}
                  >
                    <img src={p.image} alt="" className="h-16 w-16 object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-x pb-16">
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
            {twinned.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => setActive(p)}
                className="group overflow-hidden rounded-3xl border border-cream/10 bg-white/5 text-left backdrop-blur transition hover:-translate-y-1"
              >
                <img src={p.image} alt="" className="aspect-square w-full object-cover transition group-hover:scale-105" />
                <div className="p-5">
                  <div className="text-[10px] uppercase tracking-widest text-gold">Twin · 0xTW·{p.id.toUpperCase()}·{4000 + parseInt(p.id.slice(1))}</div>
                  <div className="mt-2 font-display text-lg">{p.name}</div>
                  <div className="mt-2 text-xs text-cream/60">{p.artisan} · {p.village}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/digital-twin")({
  head: () => ({ meta: [{ title: "Digital Twin — NAVSHAKTHI" }, { name: "description", content: "3D digital twins with blockchain-anchored provenance for every craft." }] }),
  component: Page,
});
