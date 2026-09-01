import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { Upload, Crop, Sun, Scissors, Wand2, Download } from "lucide-react";
import productPottery from "@/assets/product-pottery.jpg";

const STEPS = [
  "Detecting product boundaries",
  "Removing background clutter",
  "Correcting lighting and white balance",
  "Cropping to standard e-commerce ratio",
  "Applying sharpening and color correction",
  "Generating final catalog-ready image",
];

const STAGES = [
  { icon: Upload, title: "Upload raw photo (any lighting, any background)" },
  { icon: Scissors, title: "AI detects product and removes background" },
  { icon: Sun, title: "Lighting, contrast and color auto-corrected" },
  { icon: Crop, title: "Export in marketplace-ready format (1:1, white)" },
];

const TECH = [
  { name: "U²-Net", desc: "Deep learning background segmentation" },
  { name: "rembg", desc: "Production background removal pipeline" },
  { name: "OpenCV", desc: "Lighting and white-balance correction" },
  { name: "PIL / Pillow", desc: "Standardized cropping and export formatting" },
];

function Page() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <PublicPage>
      <PageHero
        eyebrow="Feature · AI Image Studio"
        title="AI Image Studio"
        subtitle="Every artisan photo gets studio-grade treatment — background removed, lighting corrected, and formatted for e-commerce in seconds. No camera skills required."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the enhancer</div>
              <p className="mt-1 text-sm text-muted-foreground">Upload a raw product photo and see the AI clean-up in action.</p>

              <label className="mt-5 flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 text-center text-xs text-muted-foreground hover:border-primary/50">
                <Upload className="h-6 w-6 text-primary" />
                <span className="font-semibold text-foreground">Drag &amp; drop a photo</span>
                <span>or click to browse — JPG / PNG, max 10 MB</span>
                <input type="file" accept="image/*" className="hidden" onChange={() => toast("Photo attached")} />
              </label>

              <button
                onClick={() => { setDone(false); setRunning(true); toast("Enhancing photo…"); }}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Enhancing…" : done ? "Enhance again" : "Enhance photo"}
              </button>

              {done && (
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <figure>
                    <img src={productPottery} alt="Original artisan product photo" className="aspect-square w-full rounded-2xl object-cover brightness-75 contrast-75 saturate-50" />
                    <figcaption className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Original</figcaption>
                  </figure>
                  <figure>
                    <img src={productPottery} alt="AI-enhanced catalog-ready product photo" className="aspect-square w-full rounded-2xl bg-white object-contain p-4 shadow-sm brightness-110 contrast-110 saturate-125" />
                    <figcaption className="mt-2 text-center text-[10px] font-semibold uppercase tracking-widest text-primary">AI-enhanced</figcaption>
                  </figure>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ScanPipeline
              running={running}
              steps={STEPS}
              title="Image Enhancement Pipeline"
              onDone={() => { setRunning(false); setDone(true); toast.success("Catalog-ready image generated"); }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Workflow</div>
              <h2 className="mt-2 font-display text-3xl">A 4-stage enhancement journey</h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAGES.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-border/60 bg-card p-5">
                  <s.icon className="h-6 w-6 text-primary" />
                  <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Step {i + 1}</div>
                  <div className="mt-1 font-display text-base">{s.title}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">AI stack</div>
            <h2 className="mt-2 font-display text-3xl">Powered by state-of-the-art models</h2>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.05}>
              <div className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">{t.name}</div>
                <div className="mt-3 text-sm text-muted-foreground">{t.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FeatureCta
        heading="Every craft deserves a professional first impression."
        icon={Wand2}
        secondary="See it on live products"
      />
    </PublicPage>
  );
}

export function FeatureCta({ heading, icon: Icon = Download, secondary }: { heading: string; icon?: typeof Download; secondary: string }) {
  return (
    <section className="container-x pb-24">
      <Reveal>
        <div className="rounded-[2.5rem] bg-earth p-10 text-cream md:p-14">
          <Icon className="h-8 w-8 text-gold" />
          <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">{heading}</h2>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/auth/signup" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-earth hover:bg-gold/90">
              Try it as an artisan
            </Link>
            <Link to="/marketplace" className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold hover:bg-white/10">
              {secondary}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export const Route = createFileRoute("/ai-image-studio")({
  head: () => ({ meta: [
    { title: "AI Image Studio — NAVSHAKTHI" },
    { name: "description", content: "Studio-grade artisan product photos in seconds: AI background removal, lighting correction and marketplace-ready cropping." },
    { property: "og:title", content: "AI Image Studio — NAVSHAKTHI" },
    { property: "og:description", content: "U²-Net, rembg and OpenCV turn any raw craft photo into a catalog-ready image." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});
