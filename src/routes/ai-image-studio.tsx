import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { Upload, Crop, Sun, Scissors, Wand2, Download, RotateCcw, ImageIcon } from "lucide-react";
import { DEFAULT_ENHANCE, enhanceImage, loadImage, scoreImage, type EnhanceOptions } from "@/lib/image-enhance";

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

type Scores = { sharpness: number; exposure: number; contrast: number };

function Page() {
  const [running, setRunning] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState<string | null>(null);
  const [enhanced, setEnhanced] = useState<string | null>(null);
  const [scores, setScores] = useState<Scores | null>(null);
  const [bgPercent, setBgPercent] = useState(0);
  const [opts, setOpts] = useState<EnhanceOptions>(DEFAULT_ENHANCE);
  const [split, setSplit] = useState(50);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accept = useCallback(async (f: File | undefined | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return toast.error("Please choose a JPG or PNG image");
    if (f.size > 10 * 1024 * 1024) return toast.error("Image is larger than 10 MB");
    try {
      const img = await loadImage(f);
      imgRef.current = img;
      setFile(f);
      setOriginal(img.src ? URL.createObjectURL(f) : null);
      setEnhanced(null);
      setScores(scoreImage(img));
      toast.success("Photo loaded", { description: `${f.name} · ${img.width}×${img.height}` });
    } catch {
      toast.error("Could not read that image");
    }
  }, []);

  const run = () => {
    if (!imgRef.current) {
      inputRef.current?.click();
      return toast("Choose a photo from your laptop first");
    }
    setEnhanced(null);
    setRunning(true);
    toast("Enhancing photo…");
  };

  const finish = () => {
    setRunning(false);
    if (!imgRef.current) return;
    const { dataUrl, bgPercent } = enhanceImage(imgRef.current, opts);
    setEnhanced(dataUrl);
    setBgPercent(bgPercent);
    setSplit(50);
    toast.success("Catalog-ready image generated");
  };

  const reset = () => {
    imgRef.current = null;
    setFile(null);
    setOriginal(null);
    setEnhanced(null);
    setScores(null);
    setOpts(DEFAULT_ENHANCE);
  };

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
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-display text-2xl">Try the enhancer</div>
                  <p className="mt-1 text-sm text-muted-foreground">Upload a photo from your laptop — it is processed privately in your browser.</p>
                </div>
                {file && (
                  <button onClick={reset} className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>

              <label
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); void accept(e.dataTransfer.files?.[0]); }}
                className={`mt-5 flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed text-center text-xs text-muted-foreground transition ${dragging ? "border-primary bg-primary/10" : "border-border/60 bg-muted/30 hover:border-primary/50"}`}
              >
                {original ? (
                  <img src={original} alt="Uploaded artisan product" className="h-full w-full object-contain" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-primary" />
                    <span className="font-semibold text-foreground">Drag &amp; drop a photo</span>
                    <span>or click to browse — JPG / PNG, max 10 MB</span>
                  </>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => void accept(e.target.files?.[0])}
                />
              </label>

              {file && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">{file.name}</span>
                  <span>· {(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}

              {scores && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {([["Sharpness", scores.sharpness], ["Exposure", scores.exposure], ["Contrast", scores.contrast]] as const).map(([k, v]) => (
                    <div key={k} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{k}</div>
                      <div className="mt-1 font-display text-xl">{v}<span className="text-xs text-muted-foreground">/100</span></div>
                      <div className="mt-2 h-1.5 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Slider label="Brightness" value={opts.brightness} min={0.8} max={1.4} step={0.02} onChange={(v) => setOpts((o) => ({ ...o, brightness: v }))} />
                <Slider label="Contrast" value={opts.contrast} min={0.8} max={1.5} step={0.02} onChange={(v) => setOpts((o) => ({ ...o, contrast: v }))} />
                <Slider label="Saturation" value={opts.saturation} min={0.6} max={1.6} step={0.02} onChange={(v) => setOpts((o) => ({ ...o, saturation: v }))} />
                <Slider label="Background cut" value={opts.tolerance} min={0} max={140} step={2} onChange={(v) => setOpts((o) => ({ ...o, tolerance: v, removeBackground: v > 0 }))} format={(v) => String(Math.round(v))} />
              </div>

              <button
                onClick={run}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Enhancing…" : enhanced ? "Enhance again" : "Enhance photo"}
              </button>

              {enhanced && original && (
                <div className="mt-6">
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-white">
                    <img src={enhanced} alt="AI-enhanced catalog-ready product photo" className="absolute inset-0 h-full w-full object-contain" />
                    <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${split}%` }}>
                      <img src={original} alt="Original artisan product photo" className="absolute inset-0 h-full w-full object-cover" style={{ width: `${10000 / Math.max(split, 1)}%`, maxWidth: "none" }} />
                      <span className="absolute bottom-2 left-2 rounded-full bg-earth/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cream">Original</span>
                    </div>
                    <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold" style={{ left: `${split}%` }} />
                    <span className="absolute bottom-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">AI-enhanced</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={split}
                    onChange={(e) => setSplit(Number(e.target.value))}
                    aria-label="Before and after comparison"
                    className="mt-3 w-full accent-[var(--color-primary,#0B5D50)]"
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">{bgPercent}% of the background was cleaned · exported 1000×1000 JPG</div>
                    <a
                      href={enhanced}
                      download={`navshakthi-${(file?.name || "product").replace(/\.[^.]+$/, "")}-enhanced.jpg`}
                      onClick={() => toast.success("Downloading catalog-ready image")}
                      className="inline-flex items-center gap-2 rounded-full bg-earth px-5 py-2.5 text-xs font-semibold text-cream hover:bg-earth/90"
                    >
                      <Download className="h-4 w-4" /> Download image
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ScanPipeline
              running={running}
              steps={STEPS}
              title="Image Enhancement Pipeline"
              onDone={finish}
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

function Slider({ label, value, min, max, step, onChange, format }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format?: (v: number) => string }) {
  return (
    <label className="block">
      <span className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label} <span className="text-foreground">{format ? format(value) : value.toFixed(2)}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1.5 w-full" />
    </label>
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
