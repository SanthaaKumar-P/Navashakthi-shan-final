import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { Upload, Video, ShieldCheck, Sparkles, Cpu, Fingerprint, Layers, Palette, Copy, BadgeCheck } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TECH = [
  { name: "Gemini Vision", desc: "Multimodal vision for craft understanding" },
  { name: "TensorFlow", desc: "Pattern classifier for traditional motifs" },
  { name: "OpenCV", desc: "Tool-mark & texture feature extraction" },
  { name: "YOLO", desc: "Object detection for materials & parts" },
  { name: "CNN", desc: "Convolutional net for handmade / machine-made" },
  { name: "Vision Transformer", desc: "Global attention on craft composition" },
  { name: "Image Embeddings", desc: "Duplicate detection across 84,500 crafts" },
];

const STAGES = [
  { icon: Upload, title: "Upload 5 photos" },
  { icon: Video, title: "Upload 30s video" },
  { icon: Palette, title: "Select craft category" },
  { icon: Cpu, title: "AI 12-step scan" },
  { icon: Fingerprint, title: "Handmade / machine detection" },
  { icon: Layers, title: "Material recognition" },
  { icon: Sparkles, title: "Traditional pattern match" },
  { icon: Copy, title: "Duplicate check" },
  { icon: ShieldCheck, title: "Government sign-off" },
  { icon: BadgeCheck, title: "Craftmark & marketplace approval" },
];

function Page() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <PublicPage>
      <PageHero eyebrow="Feature · AI Verification" title="AI Craft Authentication" subtitle="Every craft on NAVSHAKTHI is scanned by a 12-step AI pipeline and cross-signed by government officers — so every buyer, everywhere, gets provenance they can trust." />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the pipeline</div>
              <p className="mt-1 text-sm text-muted-foreground">Simulate a full verification with mock data. In the artisan portal this runs on your real uploads.</p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 grid place-items-center text-xs text-muted-foreground">Photo 1</div>
                <div className="aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 grid place-items-center text-xs text-muted-foreground">Photo 2</div>
                <div className="aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 grid place-items-center text-xs text-muted-foreground">Photo 3</div>
                <div className="aspect-square rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 grid place-items-center text-xs text-muted-foreground">Video</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {["Pottery", "Handloom", "Metal", "Wood"].map((c, i) => (
                  <span key={c} className={`rounded-full border px-3 py-1 text-xs ${i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border/60"}`}>{c}</span>
                ))}
              </div>

              <button
                onClick={() => { setDone(false); setRunning(true); toast("AI scan started"); }}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Scanning…" : done ? "Re-run scan" : "Start AI verification"}
              </button>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ScanPipeline running={running} onDone={() => { setRunning(false); setDone(true); toast.success("Verification complete — 98% authenticity"); }} />
          </Reveal>
        </div>

        {done && (
          <Reveal>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <ResultCard label="Authenticity" value="98%" tone="primary" />
              <ResultCard label="Handmade probability" value="96%" tone="clay" />
              <ResultCard label="Machine-made" value="2%" tone="muted" />
              <ResultCard label="Confidence" value="99%" tone="gold" />
              <ResultCard label="Craft category" value="Pottery · Warli" />
              <ResultCard label="Detected material" value="River clay + rice husk" />
              <ResultCard label="Traditional pattern" value="Warli tribal · matched" />
              <ResultCard label="Government status" value="Approved · Craftmark ✓" tone="primary" />
            </div>
            <div className="mt-6 text-center">
              <Link to="/craft-passport" className="inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">View Digital Craft Passport →</Link>
            </div>
          </Reveal>
        )}
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Workflow</div>
              <h2 className="mt-2 font-display text-3xl">A 10-stage verification journey</h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
    </PublicPage>
  );
}

function ResultCard({ label, value, tone = "muted" }: { label: string; value: string; tone?: string }) {
  const bg = tone === "primary" ? "bg-primary/10 text-primary" : tone === "clay" ? "bg-clay/10 text-clay" : tone === "gold" ? "bg-gold/20 text-earth" : "bg-muted";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`mt-2 inline-flex rounded-full px-3 py-1 font-display text-lg ${bg}`}>{value}</div>
    </div>
  );
}

export const Route = createFileRoute("/ai-authentication")({
  head: () => ({ meta: [
    { title: "AI Craft Authentication — NAVSHAKTHI" },
    { name: "description", content: "12-step AI + government verification for every craft: handmade detection, material recognition, pattern match, Craftmark, Digital Twin." },
    { property: "og:title", content: "AI Craft Authentication — NAVSHAKTHI" },
    { property: "og:description", content: "Vision Transformers, CNNs, YOLO and human officers — combined." },
  ] }),
  component: Page,
});
