import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { FeatureCta } from "./ai-image-studio";
import { Mic, Languages, Tags, Sparkles, Globe2 } from "lucide-react";

const LANGS = ["Tamil", "Hindi", "Bengali", "Telugu", "Marathi", "Kannada"];

const STEPS = [
  "Transcribing voice note",
  "Detecting language",
  "Translating to English and Hindi",
  "Extracting product attributes (material, size, technique, origin)",
  "Generating SEO-friendly title and description",
  "Formatting for marketplace listing",
];

const STAGES = [
  { icon: Mic, title: "Record a voice note in your own language" },
  { icon: Languages, title: "AI transcribes and detects the language" },
  { icon: Tags, title: "Translation and product-attribute extraction" },
  { icon: Sparkles, title: "SEO-optimized listing generated in English and Hindi" },
];

const TECH = [
  { name: "Whisper", desc: "Speech-to-text across regional Indian languages" },
  { name: "IndicTrans2", desc: "High-accuracy Indian language translation" },
  { name: "Large Language Model", desc: "SEO-friendly product description generation" },
  { name: "NLP entity extraction", desc: "Material, technique, and origin tagging" },
];

function Page() {
  const [lang, setLang] = useState("Tamil");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <PublicPage>
      <PageHero
        eyebrow="Feature · Multilingual Auto-Cataloger"
        title="Speak in your language. Sell in every language."
        subtitle="Artisans describe their craft in their own regional language by voice. AI translates and writes a professional, SEO-ready listing in English and Hindi — automatically."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the cataloger</div>
              <p className="mt-1 text-sm text-muted-foreground">Record or upload a short voice note describing your product.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  onClick={() => toast("Recording voice note… (demo)")}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/60 bg-muted/30 px-4 py-6 text-sm font-semibold hover:border-primary/50"
                >
                  <Mic className="h-5 w-5 text-primary" /> Record voice note
                </button>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm"
                  aria-label="Language"
                >
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              <button
                onClick={() => { setDone(false); setRunning(true); toast("Generating listing…"); }}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Generating…" : done ? "Generate again" : "Generate listing"}
              </button>

              {done && (
                <div className="mt-6 space-y-3">
                  <ListingCard
                    label={`Original transcript · ${lang}`}
                    title="இந்த மண் பானை கைகளால் செய்யப்பட்டது"
                    body="இது நான் ஆற்று களிமண்ணில் செய்த பாரம்பரிய மண் பானை. மூன்று நாட்கள் ஆனது. தண்ணீர் குளிர்ச்சியாக இருக்கும்."
                  />
                  <ListingCard
                    label="Generated English listing"
                    title="Handmade River-Clay Terracotta Water Pot — Traditional Village Craft"
                    body="Shaped by hand over three days from river clay and fired in a traditional kiln. Keeps water naturally cool, with an unglazed earthy finish unique to each piece."
                    tone
                  />
                  <ListingCard
                    label="Generated Hindi listing"
                    title="हस्तनिर्मित नदी-मिट्टी टेराकोटा जल पात्र — पारंपरिक ग्रामीण शिल्प"
                    body="नदी की मिट्टी से तीन दिनों में हाथ से बनाया गया और पारंपरिक भट्टी में पकाया गया। पानी को प्राकृतिक रूप से ठंडा रखता है, हर पात्र अनोखा है।"
                    tone
                  />
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ScanPipeline
              running={running}
              steps={STEPS}
              title="Multilingual Listing Pipeline"
              onDone={() => { setRunning(false); setDone(true); toast.success("Listing generated in English & Hindi"); }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/40 py-16">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-widest text-clay">Workflow</div>
              <h2 className="mt-2 font-display text-3xl">A 4-stage listing journey</h2>
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

      <FeatureCta heading="No typing. No English required. Just speak." icon={Globe2} secondary="See sample listings" />
    </PublicPage>
  );
}

function ListingCard({ label, title, body, tone }: { label: string; title: string; body: string; tone?: boolean }) {
  return (
    <div className={`rounded-2xl border border-border/60 p-4 ${tone ? "bg-primary/5" : "bg-muted/40"}`}>
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-base leading-snug">{title}</div>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

export const Route = createFileRoute("/smart-cataloger")({
  head: () => ({ meta: [
    { title: "Multilingual Smart Cataloger — NAVSHAKTHI" },
    { name: "description", content: "Artisans speak in their regional language; AI transcribes, translates and writes SEO-ready listings in English and Hindi." },
    { property: "og:title", content: "Multilingual Smart Cataloger — NAVSHAKTHI" },
    { property: "og:description", content: "Whisper, IndicTrans2 and LLMs turn a voice note into a marketplace listing." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Page,
});
