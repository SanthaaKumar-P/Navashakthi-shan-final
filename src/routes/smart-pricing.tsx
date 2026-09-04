import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { FeatureCta } from "./ai-image-studio";
import { ClipboardList, ScanSearch, TrendingUp, IndianRupee, Copy, Check, Sparkles, Landmark } from "lucide-react";
import { CHANNELS, GOV_CATEGORIES, lookupGovCost, type FinishKey, type SizeKey } from "@/lib/gov-rates";

const SIZES = ["Small", "Medium", "Large"] as const;
const FINISH = ["Everyday", "Premium", "Collector"] as const;

const STEPS = [
  "Fetching government raw-material rate schedule",
  "Reading notified skilled-artisan wage board",
  "Estimating make-time from craft norms",
  "Comparing with similar listings in category",
  "Checking e-NAM / HEPC demand trend",
  "Calculating fair price range",
];

const STAGES = [
  { icon: ClipboardList, title: "Pick the craft, size and finish — nothing else" },
  { icon: Landmark, title: "Material and wage rates pulled from government schedules" },
  { icon: TrendingUp, title: "Market trend and demand data factored in" },
  { icon: IndianRupee, title: "Fair price range suggested with reasoning shown" },
];

const TECH = [
  { name: "Govt. rate book", desc: "DC (Handicrafts), Labour Ministry & e-NAM feeds" },
  { name: "XGBoost", desc: "Gradient-boosted price prediction model" },
  { name: "CV quality scoring", desc: "Photo-quality-adjusted pricing" },
  { name: "Comparable listings engine", desc: "Cross-referencing similar verified crafts" },
];

const rupee = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

function Page() {
  const [category, setCategory] = useState(GOV_CATEGORIES[0].name);
  const [size, setSize] = useState<SizeKey>("Medium");
  const [finish, setFinish] = useState<FinishKey>("Premium");
  const [channel, setChannel] = useState(CHANNELS[0].name);
  const [gi, setGi] = useState(true);
  const [margin, setMargin] = useState(35);
  const [volume, setVolume] = useState(12);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const model = useMemo(() => {
    const gov = lookupGovCost(category, size, finish);
    const cat = gov.cat;
    const ch = CHANNELS.find((c) => c.name === channel)!;
    const material = gov.material;
    const labor = gov.labor;
    const hours = gov.hours;
    const overhead = (material + labor) * 0.12;
    const giPremium = gi ? (material + labor) * 0.18 : 0;
    const base = (material + labor + overhead + giPremium) * gov.valueFactor * ch.uplift;
    const withMargin = base * (1 + margin / 100);
    const fee = withMargin * ch.fee;
    const suggested = withMargin + fee;
    const low = suggested * 0.94;
    const high = suggested * 1.12;
    const mela = suggested * 0.62;
    const retail = suggested * 1.48;
    const artisanTakeHome = suggested - fee - material;
    const confidence = Math.min(96, 70 + (gi ? 8 : 0) + (finish === "Collector" ? 6 : 3) + Math.min(10, hours / 3));
    const trend = [0.82, 0.86, 0.9, 0.88, 0.95, 1].map((v) => v * (1 + cat.demand / 100));
    return { cat, ch, material, labor, hours, overhead, giPremium, fee, suggested, low, high, mela, retail, artisanTakeHome, confidence, trend };
  }, [category, channel, size, finish, gi, margin]);

  const barMax = model.retail * 1.05;

  return (
    <PublicPage>
      <PageHero
        eyebrow="Feature · Dynamic Pricing Assistant"
        title="Never underprice your craft again."
        subtitle="Fully automated. Material rates and artisan wages are pulled from Government of India schedules — the artisan enters no costs. AI adds photo quality, craft norms and live market demand to suggest a fair price."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the pricing assistant</div>
              <p className="mt-1 text-sm text-muted-foreground">Choose the craft — costs are fetched automatically from government rate schedules.</p>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Craft category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm">
                    {GOV_CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Selling channel">
                  <select value={channel} onChange={(e) => setChannel(e.target.value)} className="w-full rounded-xl border border-border/60 bg-background px-3 py-2.5 text-sm">
                    {CHANNELS.map((c) => <option key={c.name}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Size">
                  <Pills options={SIZES} value={size} onChange={setSize} />
                </Field>
                <Field label="Finish level">
                  <Pills options={FINISH} value={finish} onChange={setFinish} />
                </Field>
              </div>

              <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/10 p-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-clay">
                  <Landmark className="h-3.5 w-3.5" /> Auto-fetched government data
                </div>
                <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                  <GovStat label="Raw material" value={rupee(model.material)} hint={model.cat.materialUnit} />
                  <GovStat label="Notified wage" value={`₹${model.cat.wageHour}/hr`} hint="skilled artisan category" />
                  <GovStat label="Craft make-time" value={`${model.hours} hrs`} hint="DC (Handicrafts) norm" />
                </dl>
                <div className="mt-3 text-[11px] text-muted-foreground">Source: {model.cat.source} · updated {model.cat.updated}</div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label={`Artisan margin · ${margin}%`}>
                  <input type="range" min={10} max={80} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full" />
                </Field>
                <Field label={`Pieces per month · ${volume}`}>
                  <input type="range" min={1} max={60} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full" />
                </Field>
              </div>

              <label className="mt-4 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm">
                <input type="checkbox" checked={gi} onChange={(e) => setGi(e.target.checked)} className="h-4 w-4 accent-current text-primary" />
                <span><span className="font-semibold">GI-tagged / Craftmark verified</span> — adds an authenticity premium</span>
              </label>

              <button
                onClick={() => { setDone(false); setRunning(true); toast("Fetching government rates & market data…"); }}
                disabled={running}
                className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Calculating…" : done ? "Recalculate" : "Suggest price"}
              </button>


              {done && (
                <div className="mt-6 space-y-5 rounded-2xl border border-border/60 bg-primary/5 p-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Suggested price range</div>
                      <div className="mt-1 font-display text-3xl text-primary">{rupee(model.low)} – {rupee(model.high)}</div>
                    </div>
                    <button
                      onClick={() => { void navigator.clipboard?.writeText(`${rupee(model.low)} – ${rupee(model.high)}`); setCopied(true); toast.success("Price copied"); setTimeout(() => setCopied(false), 1600); }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold"
                    >
                      {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />} Copy
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Bar label="Average mela price" value={model.mela} max={barMax} tone="bg-clay/60" />
                    <Bar label="Suggested fair price" value={model.suggested} max={barMax} tone="bg-primary" highlight />
                    <Bar label="Online retail equivalent" value={model.retail} max={barMax} tone="bg-earth/60" />
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cost breakdown</div>
                    <dl className="mt-2 divide-y divide-border/60 text-sm">
                      {[["Raw material (govt. rate)", model.material], [`Labor (${model.hours} h × ₹${model.cat.wageHour} notified wage)`, model.labor], ["Workshop overhead", model.overhead], ["Authenticity premium", model.giPremium], [`${model.ch.name} fee`, model.fee]].map(([k, v]) => (
                        <div key={String(k)} className="flex justify-between py-1.5">
                          <dt className="text-muted-foreground">{k as string}</dt>
                          <dd className="font-semibold">{rupee(v as number)}</dd>
                        </div>
                      ))}
                      <div className="flex justify-between py-2 text-primary">
                        <dt className="font-semibold">Artisan take-home / piece</dt>
                        <dd className="font-display text-lg">{rupee(model.artisanTakeHome)}</dd>
                      </div>
                    </dl>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Stat label="Monthly earning" value={rupee(model.artisanTakeHome * volume)} hint={`${volume} pieces`} />
                    <Stat label="Model confidence" value={`${Math.round(model.confidence)}%`} hint="vs 340 comparables" />
                    <Stat label="Demand trend" value={`+${model.cat.demand}%`} hint={<Spark points={model.trend} />} />
                  </div>

                  <p className="flex gap-2 text-sm text-muted-foreground">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                    <span>
                      {finish} {category.toLowerCase()} at this size sells strongest on {model.ch.name.toLowerCase()} right now — demand is up {model.cat.demand}% this month
                      {gi ? " and GI-verified pieces are clearing 18% above unverified listings" : ", and verifying this craft could add ~18% more"}. Pricing below {rupee(model.low)} leaves money with the middleman.
                    </span>
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

function Pills<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${value === o ? "border-primary bg-primary text-primary-foreground" : "border-border/60 hover:bg-muted"}`}
        >{o}</button>
      ))}
    </div>
  );
}

function Bar({ label, value, max, tone, highlight }: { label: string; value: number; max: number; tone: string; highlight?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <span className={highlight ? "text-primary" : undefined}>{label}</span>
        <span className={highlight ? "text-primary" : "text-foreground"}>{rupee(value)}</span>
      </div>
      <div className="mt-1 h-2.5 rounded-full bg-muted">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-3">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function Spark({ points }: { points: number[] }) {
  const max = Math.max(...points);
  const d = points.map((p, i) => `${(i / (points.length - 1)) * 100},${28 - (p / max) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" className="h-6 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline points={d} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-primary" vectorEffect="non-scaling-stroke" />
    </svg>
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
