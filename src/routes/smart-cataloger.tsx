import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { FeatureCta } from "./ai-image-studio";
import { saveCraftCatalog } from "@/lib/craft-draft";
import {
  Mic,
  Square,
  Languages,
  Tags,
  Sparkles,
  Globe2,
  Copy,
  Check,
  Download,
  Hash,
  Loader2,
  Volume2,
} from "lucide-react";

const LANGS = [
  { label: "Auto Detect", code: "" },
  { label: "Tamil", code: "Tamil" },
  { label: "Hindi", code: "Hindi" },
  { label: "Bengali", code: "Bengali" },
  { label: "Telugu", code: "Telugu" },
  { label: "Marathi", code: "Marathi" },
  { label: "Kannada", code: "Kannada" },
  { label: "Malayalam", code: "Malayalam" },
  { label: "Gujarati", code: "Gujarati" },
  { label: "Punjabi", code: "Punjabi" },
  { label: "Odia", code: "Odia" },
  { label: "Assamese", code: "Assamese" },
  { label: "English", code: "English" },
] as const;

const PIPELINE_STEPS = [
  "Transcribing voice note",
  "Detecting language",
  "Translating to English and Hindi",
  "Extracting product attributes",
  "Generating SEO-friendly title and description",
  "Formatting for marketplace listing",
];

const STAGES = [
  { icon: Mic, title: "Speak naturally in your regional language" },
  { icon: Languages, title: "AI transcribes and detects the language" },
  { icon: Tags, title: "Product facts and attributes are extracted" },
  { icon: Sparkles, title: "Professional English and Hindi listings are generated" },
];

const TECH = [
  { name: "Gemini 3.5 Transcribe", desc: "Speech-to-text with automatic language identification and Indian-language support." },
  { name: "Gemini structured output", desc: "Consistent JSON for product attributes, listings, SEO fields and confidence." },
  { name: "Grounded extraction", desc: "Only facts present in the artisan's voice note are used; missing facts remain Not provided." },
  { name: "Marketplace-ready output", desc: "English/Hindi title, description, meta description, alt text, keywords and hashtags." },
];

type Catalog = {
  detectedLanguage: string;
  product: Record<string, string>;
  english: {
    title: string;
    description: string;
    metaDescription: string;
    altText: string;
  };
  hindi: {
    title: string;
    description: string;
    metaDescription: string;
    altText: string;
  };
  seoKeywords: string[];
  hashtags: string[];
  confidence: number;
};

type PipelineState = "idle" | "transcribing" | "generating" | "done";

const formatTime = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

const preferredMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function Page() {
  const [language, setLanguage] = useState("");
  const [pipeline, setPipeline] = useState<PipelineState>("idle");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [tab, setTab] = useState<"Regional" | "English" | "Hindi">("English");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      recorderRef.current?.stream.getTracks().forEach((track) => track.stop());
    };
  }, [audioUrl]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType =
        preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        stream.getTracks().forEach((track) => track.stop());

        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setFileName(`voice-note.${blob.type.includes("mp4") ? "m4a" : "webm"}`);
        toast.success("Voice note captured");
      };

      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      setTranscript("");
      setCatalog(null);
      setPipeline("idle");

      timerRef.current = setInterval(() => {
        setSeconds((value) => value + 1);
      }, 1000);
    } catch {
      toast.error("Microphone access was blocked. Please allow microphone access and try again.");
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    recorderRef.current = null;
    stopTimer();
    setRecording(false);
  };

  const handleAudioUpload = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast.error("Please choose an audio file.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      toast.error("Audio file must be 8 MB or smaller.");
      return;
    }

    if (audioUrl) URL.revokeObjectURL(audioUrl);

    setAudioBlob(file);
    setAudioUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setTranscript("");
    setCatalog(null);
    setPipeline("idle");
    setSeconds(0);
    toast.success("Audio file ready");
  };

  const generateListing = async () => {
    if (!audioBlob) {
      toast.error("Record or upload a voice note first.");
      return;
    }

    if (audioBlob.size > 8 * 1024 * 1024) {
      toast.error("Audio file must be 8 MB or smaller.");
      return;
    }

    try {
      setCatalog(null);
      setTranscript("");
      setPipeline("transcribing");

      const formData = new FormData();
      formData.append(
        "audio",
        audioBlob,
        fileName || (audioBlob.type.includes("mp4") ? "voice-note.m4a" : "voice-note.webm"),
      );
      formData.append("language", language);

      const transcriptionResponse = await fetch("/api/cataloger/transcribe", {
        method: "POST",
        body: formData,
      });

      const transcriptionData = await transcriptionResponse.json();

      if (!transcriptionResponse.ok || !transcriptionData.success) {
        throw new Error(transcriptionData.error || "Transcription failed.");
      }

      const nextTranscript = String(transcriptionData.transcript || "").trim();
      if (!nextTranscript) throw new Error("No speech was detected in the audio.");

      setTranscript(nextTranscript);
      setPipeline("generating");

      const generationResponse = await fetch("/api/cataloger/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: nextTranscript,
          language: transcriptionData.languageHint || language,
        }),
      });

      const generationData = await generationResponse.json();

      if (!generationResponse.ok || !generationData.success) {
        throw new Error(generationData.error || "Catalog generation failed.");
      }

      const generatedCatalog = generationData.catalog as Catalog;

      setCatalog(generatedCatalog);

      saveCraftCatalog({
        detectedLanguage: generatedCatalog.detectedLanguage,
        transcript: nextTranscript,
        product: generatedCatalog.product,
        english: generatedCatalog.english,
        hindi: generatedCatalog.hindi,
        seoKeywords: generatedCatalog.seoKeywords,
        hashtags: generatedCatalog.hashtags,
        confidence: generatedCatalog.confidence,
      });

      window.dispatchEvent(
        new Event("navshakthi:craft-draft-updated"),
      );

      setTab("English");
      setPipeline("done");
      toast.success("English & Hindi marketplace listings generated");
    } catch (error) {
      setPipeline("idle");
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  const copyListing = async () => {
    if (!catalog) return;

    const content =
      tab === "Regional"
        ? transcript
        : tab === "English"
          ? `${catalog.english.title}\n\n${catalog.english.description}`
          : `${catalog.hindi.title}\n\n${catalog.hindi.description}`;

    try {
      await navigator.clipboard.writeText(
        `${content}\n\nKeywords: ${catalog.seoKeywords.join(", ")}\nHashtags: ${catalog.hashtags.join(" ")}`,
      );
      setCopied(true);
      toast.success("Listing copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy the listing.");
    }
  };

  const exportListing = () => {
    if (!catalog) return;

    const payload = {
      sourceLanguage: catalog.detectedLanguage,
      transcript,
      product: catalog.product,
      english: catalog.english,
      hindi: catalog.hindi,
      seoKeywords: catalog.seoKeywords,
      hashtags: catalog.hashtags,
      confidence: catalog.confidence,
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "navshakthi-marketplace-listing.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Marketplace JSON exported");
  };

  const activeListing = catalog
    ? tab === "Regional"
      ? { title: `Original transcript · ${catalog.detectedLanguage}`, body: transcript }
      : tab === "English"
        ? { title: catalog.english.title, body: catalog.english.description }
        : { title: catalog.hindi.title, body: catalog.hindi.description }
    : null;

  const productEntries = catalog
    ? Object.entries(catalog.product).filter(([key]) => key !== "name")
    : [];

  const currentStep =
    pipeline === "transcribing"
      ? 1
      : pipeline === "generating"
        ? 3
        : pipeline === "done"
          ? 6
          : 0;

  return (
    <PublicPage>
      <PageHero
        eyebrow="AI commerce"
        title="Multilingual Smart Cataloger"
        subtitle="Speak about your craft in your own language. NAVSHAKTHI turns the voice note into professional English and Hindi marketplace content."
      />

      <section className="container-x pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Try the cataloger
                  </div>
                  <h2 className="mt-2 font-display text-2xl">Just speak. We handle the listing.</h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Record a short product story or upload an audio note. No English typing is required.
                  </p>
                </div>

                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Globe2 className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Voice language
                  </span>
                  <select
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    disabled={recording || pipeline !== "idle"}
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {LANGS.map((item) => (
                      <option key={item.label} value={item.code}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex cursor-pointer items-end">
                  <span className="inline-flex h-[46px] items-center gap-2 rounded-xl border border-border/60 bg-background px-4 text-sm font-semibold">
                    <Download className="h-4 w-4" />
                    Upload audio
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleAudioUpload(file);
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-5">
                <div className="flex flex-col items-center justify-center gap-4 py-5 text-center">
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    disabled={pipeline !== "idle"}
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full transition ${
                      recording
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={recording ? "Stop recording" : "Start recording"}
                  >
                    {recording ? <Square className="h-6 w-6 fill-current" /> : <Mic className="h-7 w-7" />}
                  </button>

                  <div>
                    <div className="font-display text-lg">
                      {recording ? "Recording voice note…" : "Record a voice note"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {recording ? formatTime(seconds) : "Describe the product naturally"}
                    </div>
                  </div>
                </div>
              </div>

              {audioUrl && (
                <div className="mt-4 rounded-2xl border border-border/60 bg-background p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    <Volume2 className="h-3.5 w-3.5" />
                    Voice note ready
                  </div>
                  <audio controls src={audioUrl} className="w-full" />
                  <div className="mt-2 truncate text-xs text-muted-foreground">{fileName}</div>
                </div>
              )}

              <button
                type="button"
                onClick={generateListing}
                disabled={!audioBlob || recording || pipeline !== "idle"}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-earth px-5 py-3.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pipeline !== "idle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {pipeline === "transcribing"
                  ? "Transcribing…"
                  : pipeline === "generating"
                    ? "Generating marketplace listing…"
                    : "Generate marketplace listing"}
              </button>

              {transcript && (
                <div className="mt-5 rounded-2xl border border-border/60 bg-primary/5 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    AI transcript · {catalog?.detectedLanguage || "detected language"}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{transcript}</p>
                </div>
              )}

              {catalog && activeListing && (
                <div className="mt-5 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {(["Regional", "English", "Hindi"] as const).map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setTab(item)}
                        className={`rounded-full px-4 py-2 text-xs font-semibold ${
                          tab === item
                            ? "bg-primary text-primary-foreground"
                            : "border border-border/60 bg-background"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-primary/5 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {tab === "Regional" ? "Voice transcript" : `Generated ${tab} listing`}
                    </div>
                    <div className="mt-2 font-display text-lg leading-snug">{activeListing.title}</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {activeListing.body}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={copyListing}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-semibold"
                      >
                        {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={exportListing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-earth px-3 py-1.5 text-xs font-semibold text-cream"
                      >
                        <Download className="h-3 w-3" />
                        Export JSON
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Extracted product attributes
                    </div>

                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      {productEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between gap-3 border-b border-border/40 pb-1.5"
                        >
                          <dt className="capitalize text-muted-foreground">
                            {key.replace(/([A-Z])/g, " $1")}
                          </dt>
                          <dd className="text-right font-semibold">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-4">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      SEO keywords
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {catalog.seoKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Social hashtags
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {catalog.hashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-clay"
                        >
                          <Hash className="h-3 w-3" />
                          {hashtag.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      AI confidence: <span className="font-semibold text-foreground">{Math.round(catalog.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-border/60 bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Live workflow
                  </div>
                  <h2 className="mt-2 font-display text-2xl">Multilingual Listing Pipeline</h2>
                </div>
                {pipeline === "done" && <Check className="h-5 w-5 text-primary" />}
              </div>

              <div className="mt-6 space-y-3">
                {PIPELINE_STEPS.map((step, index) => {
                  const stepNumber = index + 1;
                  const active = currentStep === stepNumber;
                  const completed = currentStep > stepNumber;

                  return (
                    <div
                      key={step}
                      className={`flex gap-3 rounded-xl border p-3 ${
                        active
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/50 bg-background"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          completed || active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {completed ? <Check className="h-3.5 w-3.5" /> : stepNumber}
                      </div>
                      <div className="pt-1 text-sm font-medium">{step}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
                Steps 3–5 are produced together by one structured AI generation call after transcription.
                This keeps the workflow fast while preserving predictable marketplace-ready output.
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">How it works</div>
            <h2 className="mt-2 font-display text-3xl">From a voice note to a professional catalog entry</h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, index) => (
            <Reveal key={stage.title} delay={index * 0.05}>
              <div className="h-full rounded-2xl border border-border/60 bg-card p-5">
                <stage.icon className="h-6 w-6 text-primary" />
                <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {index + 1}
                </div>
                <div className="mt-1 font-display text-base">{stage.title}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">AI stack</div>
            <h2 className="mt-2 font-display text-3xl">Built for artisan-first commerce</h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH.map((tech, index) => (
            <Reveal key={tech.name} delay={index * 0.05}>
              <div className="rounded-2xl border border-border/60 bg-card p-5">
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  {tech.name}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{tech.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <FeatureCta
        heading="No typing. No English required. Just speak."
        icon={Globe2}
        secondary="See sample listings"
      />
    </PublicPage>
  );
}

export const Route = createFileRoute("/smart-cataloger")({
  head: () => ({
    meta: [
      { title: "Multilingual Smart Cataloger — NAVSHAKTHI" },
      {
        name: "description",
        content:
          "Artisans speak in their regional language; AI transcribes, translates and writes SEO-ready listings in English and Hindi.",
      },
      {
        property: "og:title",
        content: "Multilingual Smart Cataloger — NAVSHAKTHI",
      },
      {
        property: "og:description",
        content:
          "Turn a regional-language artisan voice note into a professional marketplace listing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
