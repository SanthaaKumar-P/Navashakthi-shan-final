import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { KioskMap, KIOSKS, type Kiosk } from "@/components/kiosk/KioskMap";
import { UserPlus, Landmark, Sparkles, Camera, Upload, ShoppingBag, GraduationCap, Coins, Shield, Globe2, Award, CreditCard, HelpCircle, Search } from "lucide-react";

const SERVICES = [
  { icon: UserPlus, title: "Artisan Registration", desc: "Aadhaar + Udyam + Vishwakarma in one visit" },
  { icon: Landmark, title: "Government Schemes", desc: "Match & apply to 40+ central + state schemes" },
  { icon: Sparkles, title: "Digital Twin Creation", desc: "3D scan of your craft on the spot" },
  { icon: Camera, title: "Photography", desc: "Studio-grade product shoot" },
  { icon: Upload, title: "Product Upload", desc: "Guided catalog entry to marketplace" },
  { icon: ShoppingBag, title: "Marketplace Registration", desc: "Storefront + payments setup" },
  { icon: GraduationCap, title: "Training & Skill Development", desc: "Book NSDC-certified workshops" },
  { icon: Coins, title: "Loan Assistance", desc: "Mudra & PM Vishwakarma pre-approval" },
  { icon: Shield, title: "Insurance", desc: "PM Suraksha Bima signup" },
  { icon: Globe2, title: "Export Guidance", desc: "IEC, DGFT and buyer discovery" },
  { icon: Award, title: "Certification", desc: "GI + Craftmark filing" },
  { icon: CreditCard, title: "NFC Card Generation", desc: "Print your Digital Artisan ID" },
  { icon: HelpCircle, title: "Government Help Desk", desc: "Live officer support for grievances" },
];

function Page() {
  const [selected, setSelected] = useState<Kiosk | null>(null);
  const [q, setQ] = useState("");
  const filtered = KIOSKS.filter((k) => `${k.name} ${k.state}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <PublicPage>
      <PageHero eyebrow="Feature · Village Smart Centre" title="Smart Kiosk Portal" subtitle="Government-supported village service centres bring the full NAVSHAKTHI platform to rural India — registration, uploads, schemes, certificates, in one visit." />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Find your nearest kiosk</div>
              <h2 className="mt-2 font-display text-3xl">1,240+ centres across India</h2>
              <div className="relative mt-6">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search state or village…" className="w-full rounded-full border border-border/60 bg-card py-3 pl-11 pr-4 text-sm outline-none focus:border-primary" />
              </div>

              <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                {filtered.map((k) => (
                  <button key={k.id} onClick={() => setSelected(k)} className={`flex w-full items-center justify-between rounded-2xl border p-3 text-left transition ${selected?.id === k.id ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:bg-muted"}`}>
                    <div>
                      <div className="font-semibold">{k.name}</div>
                      <div className="text-xs text-muted-foreground">{k.state}</div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${k.live ? "bg-emerald-500/15 text-emerald-700" : "bg-muted text-muted-foreground"}`}>{k.live ? "Live" : "Offline"}</span>
                  </button>
                ))}
              </div>

              <Link to="/kiosk-appointment" className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Book appointment →</Link>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <KioskMap onSelect={setSelected} selected={selected?.id} />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Services</div>
              <h2 className="mt-2 font-display text-3xl">Everything an artisan needs — under one roof</h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.03}>
                <div className="h-full rounded-2xl border border-border/60 bg-card p-5 transition hover:-translate-y-1 hover:shadow-elegant">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                  <div className="mt-3 font-display text-base">{s.title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicPage>
  );
}

export const Route = createFileRoute("/smart-kiosk-portal")({
  head: () => ({ meta: [
    { title: "Smart Kiosk Portal — NAVSHAKTHI" },
    { name: "description", content: "1,240+ village smart centres for artisan registration, uploads, schemes, certifications." },
  ] }),
  component: Page,
});
