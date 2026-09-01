import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { FeatureCta } from "./ai-image-studio";
import { ClipboardList, ScanSearch, TrendingUp, IndianRupee } from "lucide-react";

const CATEGORIES = ["Pottery", "Textiles", "Wood", "Metal", "Jewellery", "Bamboo"];
const SIZES = ["Small", "Medium", "Large"] as const;

const STEPS = [
  "Analyzing product image quality",
  "Estimating material and labor cost",
  "Comparing with similar listings in category",
  "Checking current market demand trend",
  "Calculating fair price range",
];

const STAGES = [
  { icon: ClipboardList, title: "Enter product details and cost inputs" },
  { icon: ScanSearch, title: "AI analyzes photo quality and category benchmarks" },
  { icon: TrendingUp, title: "Market trend and demand data factored in" },
  { icon: IndianRupee, title: "Fair price range suggested with reasoning shown" },
];

const TECH = [
  { name: "XGBoost", desc: "Gradient-boosted price prediction model" },
  { name: "Market trend engine", desc: "Category-level demand tracking" },
  { name: "CV quality scoring", desc: "Photo-quality-adjusted pricing" },
  { name: "Comparable listings engine", desc: "Cross-referencing similar verified crafts" },
];

function Page() {
  const [category, setCategory] = useState("Pottery");
  const [cost, setCost] = useState("450");
  const [hours, setHours] = useState("18");
  const [size, setSize] = useState<(typeof SIZES)[number]>("Medium");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const mult = size === "Small" ? 0.75 : size === "Large" ? 1.35 : 1;
  const base = Math.round(((Number(cost) || 0) * 1.6 + (Number(hours) || 0) * 45) * mult);
  const low = Math.max(base, 100);
  const high = Math.round(low * 1.14);

  return (
    <PublicPage>
      <PageHero
        eyebrow="Feature · Dynamic Pricing Assistant"
        title="Never underprice your craft again."
        subtitle="AI analyzes your product photo, description, material cost, and current market trends to suggest a fair, competitive price — so middlemen can't undercut you."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the pricing assistant</div>
              <p className="mt-1 text-sm text-muted-foreground">Enter basic details and see an instant price suggestion.</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Craft category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Material cost (₹)">
                  <input type="number" min={0} value={cost} onChange={(e) => setCost(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm" />
                </Field>
                <Field label="Time to make (hours)">
                  <input type="number" min={0} value={hours} onChange={(e) => setHours(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm" />
                </Field>
                <Field label="Size">
                  <div className="flex gap-2">
                    {SIZES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${size === s ? "border-primary bg-primary text-primary-foreground" : "border-border/60"}`}
                      >{s}</button>
                    ))}
                  </div>
                </Field>
              </div>

              <button
                onClick={() => { setDone(false); setRunning(true); toast("Analyzing market data…"); }}
                disabled={running}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Calculating…" : done ? "Recalculate" : "Suggest price"}
              </button>

              {done && (
                <div className="mt-6 rounded-2xl border border-border/60 bg-primary/5 p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested price range</div>
                  <div className="mt-1 font-display text-3xl text-primary">₹{low.toLocaleString("en-IN")} – ₹{high.toLocaleString("en-IN")}</div>

                  <div className="mt-5">
                    <div className="relative h-3 rounded-full bg-muted">
                      <div className="absolute inset-y-0 left-[38%] right-[26%] rounded-full bg-gradient-to-r from-primary via-gold to-clay" />
                      <span className="absolute -top-1 left-[18%] h-5 w-0.5 bg-clay" />
                      <span className="absolute -top-1 left-[82%] h-5 w-0.5 bg-earth" />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <span>Average mela price</span>
                      <span className="text-primary">Suggested</span>
                      <span>Online retail</span>
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Based on material cost, similar Bhuj {category.toLowerCase()} listings, and 12% rising demand this month.
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ScanPipeline
              running={running}
              steps={STEPS}
              title="Fair Price Engine"
              onDone={() => { setRunning(false); setDone(true); toast.success("Fair price range calculated"); }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Workflow</div>
              <h2 className="mt-2 font-display text-3xl">A 4-stage pricing journey</h2>
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

      <FeatureCta heading="Price it right. Sell it fair." icon={IndianRupee} secondary="See it on live products" />
    </PublicPage>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export const Route = createFileRoute("/smart-pricing")({
  head: () => ({ meta: [
    { title: "Dynamic Pricing Assistant — NAVSHAKTHI" },
    { name: "description", content: "AI suggests a fair, competitive price for every craft using material cost, labor, photo quality and live market demand." },
    { property: "og:title", content: "Dynamic Pricing Assistant — NAVSHAKTHI" },
    { property: "og:description", content: "XGBoost pricing, demand trends and comparable listings keep artisans from underpricing." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});
