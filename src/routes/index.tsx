import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Cpu, Landmark, Truck, MapPin, Award, Wand2, Languages, IndianRupee } from "lucide-react";
import { PublicLayout } from "@/components/layout/public-layout";
import { Reveal, Counter, SectionHeading, SectionEyebrow } from "@/components/section";
import { ProductCard } from "@/components/product-card";
import { categories, products, impactStats, testimonials } from "@/lib/mock-data";
import heroImg from "@/assets/hero-artisan.jpg";
import villageImg from "@/assets/village.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "NAVSHAKTHI — Where Culture Meets Crafts" },
      { name: "description", content: "AI-powered marketplace connecting India's rural artisans to the world. Verified crafts, digital twins, government schemes." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PublicLayout>
      <Hero />
      <TrustBar />
      <Categories />
      <FeaturedProducts />
      <ProblemSolution />
      <ImpactStats />
      <PlatformFeatures />
      <DigitalTwinShowcase />
      <Testimonials />
      <CTA />
    </PublicLayout>
  );
}

function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative -mt-20 min-h-[100svh] overflow-hidden bg-earth">
      <motion.div style={{ y }} className="absolute inset-0">
        <img src={heroImg} alt="Artisan at potter's wheel" className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-earth/40 via-earth/30 to-earth" />
        <div className="absolute inset-0 bg-gradient-to-r from-earth/80 via-transparent to-transparent" />
      </motion.div>

      {/* floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold/70"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
            animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2] }}
            transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>

      <motion.div style={{ opacity }} className="relative z-10 container-x pt-40 pb-24 text-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-gold backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            StartupTN Grand Finale · AI × Heritage
          </div>
          <h1 className="mt-8 font-display text-5xl leading-[0.98] sm:text-6xl md:text-7xl lg:text-8xl">
            Where <em className="italic text-gold">culture</em>
            <br /> meets <span className="text-gradient-gold">crafts.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg text-cream/80 leading-relaxed">
            An AI-powered marketplace bringing India's 70 lakh rural artisans onto a fair, verified, government-enabled global stage.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/marketplace" className="group inline-flex items-center gap-2 rounded-full bg-gold px-7 py-4 text-sm font-semibold text-earth shadow-warm hover:bg-gold/90">
              Explore marketplace <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/auth/signup" className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-white/5 px-7 py-4 text-sm font-semibold text-cream backdrop-blur hover:bg-white/10">
              Become an artisan
            </Link>
            <Link to="/portal/government" className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-4 text-sm font-medium text-cream/80 hover:text-gold">
              Government portal →
            </Link>
          </div>
        </motion.div>

        <div className="mt-24 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {impactStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
              className="border-l border-gold/30 pl-4"
            >
              <div className="font-display text-3xl text-gold sm:text-4xl">
                <Counter to={s.value} suffix={s.suffix} />
              </div>
              <div className="mt-1 text-xs uppercase tracking-widest text-cream/60">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function TrustBar() {
  const partners = ["StartupTN", "PM Vishwakarma", "Craftmark", "India Post", "TRIFED", "MSME", "SKCET", "AIACA"];
  return (
    <section className="border-y border-border/60 bg-cream py-8">
      <div className="container-x">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Trusted by ministries · missions · marketplaces
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {partners.map((p) => (
            <div key={p} className="rounded-xl border border-border/60 bg-background/50 px-4 py-3 text-center font-display text-sm text-earth/70">
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            eyebrow="Nine living traditions"
            title="Every craft has a homeland."
            subtitle="From the terracotta wheels of Bhuj to the silk pit-looms of Kanchipuram — nine categories, each mapped to its village of origin."
          />
        </Reveal>
        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
          {categories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.05}>
              <Link to="/marketplace" {...({ search: { cat: c.slug } } as any)} className="group relative flex items-center gap-5 overflow-hidden rounded-3xl border border-border/60 bg-card p-6 hover-lift">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-mesh-warm text-3xl">{c.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg text-foreground">{c.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{c.count} artisans</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedProducts() {
  return (
    <section className="bg-paper py-24">
      <div className="container-x">
        <div className="flex items-end justify-between gap-6">
          <Reveal>
            <SectionHeading
              eyebrow="This week's dispatch"
              title="Featured crafts."
              subtitle="AI-verified. Craftmark-certified. Shipped by India Post from artisan doorstep."
            />
          </Reveal>
          <Link to="/marketplace" className="hidden md:inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const items = [
    { tag: "The problem", title: "Middlemen keep 80% of a craft's value.", desc: "Rural artisans sell for pennies at melas while the same work fetches lakhs in cities. Provenance is lost. Livelihoods collapse." },
    { tag: "Our solution", title: "AI verifies. Government enables. India Post delivers.", desc: "Every craft gets a Digital Twin, an authenticity score, a scheme match, and a direct route to a global buyer — from the village itself." },
    { tag: "The impact", title: "3× fair income. Zero counterfeit. Living heritage.", desc: "Verified artisans triple their earnings within 6 months. Craft traditions revive. Villages become studios." },
  ];
  return (
    <section className="py-24">
      <div className="container-x grid gap-8 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.tag} delay={i * 0.1}>
            <div className="h-full rounded-3xl border border-border/60 bg-card p-8">
              <SectionEyebrow>{it.tag}</SectionEyebrow>
              <h3 className="mt-5 font-display text-2xl leading-tight text-foreground">{it.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{it.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function ImpactStats() {
  return (
    <section className="relative overflow-hidden bg-mesh-forest py-28 text-cream">
      <div className="container-x">
        <Reveal>
          <div className="max-w-2xl">
            <SectionEyebrow>National impact</SectionEyebrow>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl">
              A quiet revolution — measured in <span className="text-gradient-gold">villages, not vanity metrics.</span>
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Artisans onboarded", value: 1284000, suffix: "" },
            { label: "Fair income growth", value: 312, suffix: "%" },
            { label: "AI verifications / day", value: 4200, suffix: "" },
            { label: "Villages served", value: 1240, suffix: "+" },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div>
                <div className="font-display text-5xl text-gold"><Counter to={s.value} suffix={s.suffix} /></div>
                <div className="mt-2 text-sm text-cream/70">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformFeatures() {
  const feats = [
    { icon: Sparkles, title: "AI authenticity engine", desc: "Vision + provenance model scoring every craft with a 0-100 authenticity index." },
    { icon: ShieldCheck, title: "Craftmark & GI verified", desc: "Automatic matching to national handicraft standards and geographical indications." },
    { icon: Cpu, title: "3D Digital Twins", desc: "Photogrammetric twins of each craft — spin, zoom, and inspect before you buy." },
    { icon: Landmark, title: "Scheme enrolment", desc: "One-click matching to PM Vishwakarma, MSME, Mudra and 8 more schemes." },
    { icon: Truck, title: "India Post logistics", desc: "Doorstep pickup from the village, tracked delivery worldwide." },
    { icon: Award, title: "Reverse marketplace", desc: "Buyers post briefs. Artisans bid. AI matches the perfect maker." },
    { icon: Wand2, title: "AI Image Studio", desc: "Background removal, lighting correction and catalog-ready formatting for every craft photo." },
    { icon: Languages, title: "Multilingual auto-cataloger", desc: "Speak in your language — AI writes SEO listings in English and Hindi." },
    { icon: IndianRupee, title: "Dynamic pricing assistant", desc: "ML price guidance from material cost, labour hours and live market trends." },
  ];
  return (
    <section className="py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="What powers NAVSHAKTHI"
            title="Nine systems, one continuum."
            subtitle="An operating layer for the rural craft economy — from discovery to dispatch."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {feats.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.05}>
              <div className="group h-full rounded-3xl border border-border/60 bg-card p-7 hover-lift">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-xl text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function DigitalTwinShowcase() {
  return (
    <section className="py-24">
      <div className="container-x">
        <div className="grid gap-12 rounded-[2.5rem] bg-earth p-10 text-cream lg:grid-cols-2 lg:p-16">
          <Reveal>
            <div>
              <SectionEyebrow>Digital Twin technology</SectionEyebrow>
              <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
                Every craft, born <em className="italic text-gold">twice.</em>
              </h2>
              <p className="mt-5 max-w-lg text-cream/70 leading-relaxed">
                Once in the artisan's hands — and once as a photogrammetric 3D twin backed by an immutable blockchain ID. Provenance you can literally rotate in your palm.
              </p>
              <div className="mt-8 flex gap-4">
                <Link to="/digital-twin" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-earth hover:bg-gold/90">
                  See the tech
                </Link>
                <Link to="/marketplace" className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold hover:bg-white/10">
                  Browse twins
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-6">
                {["3D scan", "AI analysis", "Blockchain ID"].map((s, i) => (
                  <div key={s}>
                    <div className="font-display text-2xl text-gold">0{i + 1}</div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-cream/60">{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-forest to-earth">
              <motion.img
                src={villageImg}
                alt="village artisans"
                className="h-full w-full object-cover opacity-70"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 12, repeat: Infinity }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-earth via-transparent" />
              <div className="absolute inset-0 grid place-items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                  className="relative h-64 w-64 rounded-full border border-gold/40"
                >
                  <div className="absolute inset-6 rounded-full border border-gold/30" />
                  <div className="absolute inset-12 rounded-full border border-gold/20" />
                  <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-gold" />
                  <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-clay" />
                  <div className="absolute left-1/2 bottom-0 h-3 w-3 -translate-x-1/2 rounded-full bg-forest" />
                </motion.div>
              </div>
              <div className="absolute bottom-6 left-6 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur border border-white/20">
                <div className="text-[10px] uppercase tracking-widest text-cream/60">Twin ID</div>
                <div className="font-mono text-sm">0xTWIN·NS·84591</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-paper py-24">
      <div className="container-x">
        <Reveal>
          <SectionHeading
            align="center"
            eyebrow="Voices from the ground"
            title="Real artisans. Real buyers. Real stories."
          />
        </Reveal>
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <div className="h-full rounded-3xl border border-border/60 bg-card p-8">
                <div className="font-display text-3xl leading-none text-gold">"</div>
                <p className="mt-2 font-display text-xl leading-snug text-foreground">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 font-semibold text-primary">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="container-x py-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-[2.5rem] bg-mesh-forest p-12 text-center text-cream lg:p-20">
          <MapPin className="mx-auto h-10 w-10 text-gold" />
          <h2 className="mt-6 font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            Bring a village into your home.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-cream/80">
            Every purchase funds a school lunch, a loom repair, a daughter's tuition. Craft with consequence.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/marketplace" className="rounded-full bg-gold px-8 py-4 text-sm font-semibold text-earth hover:bg-gold/90">
              Shop the marketplace
            </Link>
            <Link to="/auth/signup" className="rounded-full border border-cream/30 px-8 py-4 text-sm font-semibold hover:bg-white/10">
              Join as artisan
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
