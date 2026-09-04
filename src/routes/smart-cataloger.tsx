import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { ScanPipeline } from "@/components/ai/ScanPipeline";
import { FeatureCta } from "./ai-image-studio";
import { Mic, Square, Languages, Tags, Sparkles, Globe2, Copy, Check, Download, Hash } from "lucide-react";

const LANGS = ["Tamil", "Hindi", "Bengali", "Telugu", "Marathi", "Kannada"] as const;
type Lang = (typeof LANGS)[number];

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

const TRANSCRIPTS: Record<Lang, string> = {
  Tamil: "இது நான் ஆற்று களிமண்ணில் செய்த பாரம்பரிய மண் பானை. மூன்று நாட்கள் ஆனது. தண்ணீர் குளிர்ச்சியாக இருக்கும்.",
  Hindi: "यह नदी की मिट्टी से बना पारंपरिक मटका है। तीन दिन लगे। पानी ठंडा रहता है।",
  Bengali: "এটি নদীর মাটি দিয়ে হাতে তৈরি ঐতিহ্যবাহী কলসি। তিন দিন লেগেছে। জল ঠান্ডা থাকে।",
  Telugu: "ఇది నది మట్టితో చేతితో చేసిన సాంప్రదాయ కుండ. మూడు రోజులు పట్టింది. నీరు చల్లగా ఉంటుంది.",
  Marathi: "हे नदीच्या मातीपासून हाताने बनवलेले पारंपरिक मडके आहे. तीन दिवस लागले. पाणी थंड राहते.",
  Kannada: "ಇದು ನದಿ ಮಣ್ಣಿನಿಂದ ಕೈಯಿಂದ ಮಾಡಿದ ಸಾಂಪ್ರದಾಯಿಕ ಮಡಕೆ. ಮೂರು ದಿನ ಆಯಿತು. ನೀರು ತಂಪಾಗಿರುತ್ತದೆ.",
};

const ATTRIBUTES = [
  { k: "Material", v: "Unglazed river clay" },
  { k: "Technique", v: "Hand-thrown, wood-fired kiln" },
  { k: "Craft time", v: "3 days" },
  { k: "Capacity", v: "≈ 5 litres" },
  { k: "Dimensions", v: "24 × 24 × 28 cm" },
  { k: "Weight", v: "1.8 kg" },
  { k: "Origin", v: "Village cluster, Tamil Nadu" },
  { k: "Care", v: "Rinse with water, no detergent" },
];

const KEYWORDS = ["handmade terracotta pot", "clay water pot", "traditional matka", "eco-friendly kitchenware", "village pottery India", "unglazed clay vessel"];
const HASHTAGS = ["#Handmade", "#Terracotta", "#MadeInIndia", "#VocalForLocal", "#SustainableLiving", "#ArtisanCraft"];

const LISTINGS = {
  English: {
    title: "Handmade River-Clay Terracotta Water Pot — Traditional Village Craft",
    body: "Shaped by hand over three days from river clay and fired in a traditional wood kiln. Keeps water naturally cool, with an unglazed earthy finish unique to each piece. Food-safe, chemical-free and made by a verified NAVSHAKTHI artisan household.",
  },
  Hindi: {
    title: "हस्तनिर्मित नदी-मिट्टी टेराकोटा जल पात्र — पारंपरिक ग्रामीण शिल्प",
    body: "नदी की मिट्टी से तीन दिनों में हाथ से बनाया गया और पारंपरिक भट्टी में पकाया गया। पानी को प्राकृतिक रूप से ठंडा रखता है, हर पात्र अनोखा है। पूरी तरह रसायन-मुक्त और सत्यापित कारीगर द्वारा निर्मित।",
  },
} as const;

function Page() {
  const [lang, setLang] = useState<Lang>("Tamil");
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [tab, setTab] = useState<"Regional" | "English" | "Hindi">("English");
  const [copied, setCopied] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks, { type: rec.mimeType || "audio/webm" })));
        toast.success("Voice note captured");
      };
      recorderRef.current = rec;
      rec.start();
      setSeconds(0);
      setRecording(true);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone blocked — you can still run the demo listing");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    stopTimer();
    setRecording(false);
  };

  const copyListing = () => {
    const l = tab === "Regional" ? { title: `Transcript · ${lang}`, body: TRANSCRIPTS[lang] } : LISTINGS[tab];
    void navigator.clipboard?.writeText(`${l.title}\n\n${l.body}\n\n${HASHTAGS.join(" ")}`);
    setCopied(true);
    toast.success("Listing copied");
    setTimeout(() => setCopied(false), 1600);
  };

  const exportListing = () => {
    const payload = {
      language: lang,
      transcript: TRANSCRIPTS[lang],
      listings: LISTINGS,
      attributes: Object.fromEntries(ATTRIBUTES.map((a) => [a.k, a.v])),
      seoKeywords: KEYWORDS,
      hashtags: HASHTAGS,
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "navshakthi-listing.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Listing exported as JSON");
  };

  const active = tab === "Regional" ? { title: `Original transcript · ${lang}`, body: TRANSCRIPTS[lang] } : LISTINGS[tab];

  return (
    <PublicPage>
      <PageHero
        eyebrow="Feature · Multilingual Auto-Cataloger"
        title="Speak in your language. Sell in every language."
        subtitle="Artisans describe their craft by voice in their own regional language. AI transcribes, translates and writes a professional, SEO-ready listing with attributes, keywords and hashtags — automatically."
      />

      <section className="container-x py-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="font-display text-2xl">Try the cataloger</div>
              <p className="mt-1 text-sm text-muted-foreground">Record a short voice note describing your product — in any listed language.</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <button
                  onClick={() => (recording ? stopRecording() : void startRecording())}
                  className={`inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-sm font-semibold transition ${recording ? "border-clay bg-clay/10 text-clay" : "border-border/60 bg-muted/30 hover:border-primary/50"}`}
                >
                  {recording ? <><Square className="h-4 w-4 animate-pulse" /> Stop · {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</> : <><Mic className="h-5 w-5 text-primary" /> Record voice note</>}
                </button>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value as Lang)}
                  className="rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm"
                  aria-label="Language"
                >
                  {LANGS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>

              {audioUrl && <audio controls src={audioUrl} className="mt-3 w-full" />}

              <button
                onClick={() => { setDone(false); setRunning(true); toast("Generating listing…"); }}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running ? "Generating…" : done ? "Generate again" : "Generate listing"}
              </button>

              {done && (
                <div className="mt-6 space-y-5">
                  <div className="flex flex-wrap gap-2">
                    {(["Regional", "English", "Hindi"] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${tab === t ? "border-primary bg-primary text-primary-foreground" : "border-border/60 hover:bg-muted"}`}
                      >{t === "Regional" ? lang : t}</button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{tab === "Regional" ? "Voice transcript" : `Generated ${tab} listing`}</div>
                    <div className="mt-2 font-display text-base leading-snug">{active.title}</div>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{active.body}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={copyListing} className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold">
                        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />} Copy
                      </button>
                      <button onClick={exportListing} className="inline-flex items-center gap-1.5 rounded-full bg-earth px-3 py-1.5 text-xs font-semibold text-cream">
                        <Download className="h-3 w-3" /> Export JSON
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Extracted product attributes</div>
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      {ATTRIBUTES.map((a) => (
                        <div key={a.k} className="flex justify-between gap-3 border-b border-border/40 pb-1.5">
                          <dt className="text-muted-foreground">{a.k}</dt>
                          <dd className="text-right font-semibold">{a.v}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">SEO keywords</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {KEYWORDS.map((k) => (
                        <span key={k} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{k}</span>
                      ))}
                    </div>
                    <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Social hashtags</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {HASHTAGS.map((h) => (
                        <span key={h} className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-clay"><Hash className="h-3 w-3" />{h.replace("#", "")}</span>
                      ))}
                    </div>
                  </div>
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
