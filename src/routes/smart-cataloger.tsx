import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { PublicPage, PageHero } from "@/components/public-page";
import { Reveal } from "@/components/section";
import { FeatureCta } from "./ai-image-studio";
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
  Dna,
  Image as ImageIcon,
  ArrowRight,
} from "lucide-react";
import {
  getCraftDraft,
  saveCraftCatalog,
  saveCraftDNA,
  type CraftCatalogDraft,
} from "@/lib/craft-draft";
import type { CraftDNA } from "@/lib/craft-dna/types";
import {
  mergeCatalogIntoCraftDNA,
  type CatalogDataForDNA,
} from "@/lib/craft-dna/merge-catalog";

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
  "Reading artisan-provided facts",
  "Updating shared Craft DNA",
  "Generating English and Hindi listings",
  "Saving marketplace-ready catalog data",
];

const STAGES = [
  { icon: Mic, title: "Speak naturally in your regional language" },
  { icon: Languages, title: "AI transcribes and detects the language" },
  { icon: Tags, title: "Product facts and attributes are extracted" },
  { icon: Dna, title: "Known facts enrich the shared Craft DNA" },
];

const TECH = [
  {
    name: "Gemini transcription",
    desc: "Speech-to-text with language identification for supported Indian languages.",
  },
  {
    name: "Structured catalog generation",
    desc: "Predictable JSON for product attributes, listings, SEO fields and confidence.",
  },
  {
    name: "Shared Craft DNA",
    desc: "Catalog facts enrich the existing craft identity instead of creating a second identity.",
  },
  {
    name: "Grounded extraction",
    desc: 'Unknown facts remain "Not provided" rather than being invented.',
  },
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
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

const preferredMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function normalizeCatalog(
  value: unknown,
): Catalog {
  const raw = (value ?? {}) as Partial<Catalog>;

  const normalizeListing = (item: unknown) => {
    const listing = (item ?? {}) as Partial<Catalog["english"]>;
    return {
      title: String(listing.title ?? "Not provided"),
      description: String(listing.description ?? "Not provided"),
      metaDescription: String(listing.metaDescription ?? "Not provided"),
      altText: String(listing.altText ?? "Not provided"),
    };
  };

  return {
    detectedLanguage: String(raw.detectedLanguage ?? "Unknown"),
    product:
      raw.product && typeof raw.product === "object"
        ? Object.fromEntries(
            Object.entries(raw.product).map(([key, item]) => [
              key,
              String(item ?? "Not provided"),
            ]),
          )
        : {},
    english: normalizeListing(raw.english),
    hindi: normalizeListing(raw.hindi),
    seoKeywords: Array.isArray(raw.seoKeywords)
      ? raw.seoKeywords.map(String)
      : [],
    hashtags: Array.isArray(raw.hashtags)
      ? raw.hashtags.map(String)
      : [],
    confidence:
      typeof raw.confidence === "number"
        ? Math.max(0, Math.min(100, raw.confidence))
        : 0,
  };
}

function toCraftCatalogDraft(
  catalog: Catalog,
  transcript: string,
): CraftCatalogDraft {
  return {
    detectedLanguage: catalog.detectedLanguage,
    transcript,
    product: catalog.product,
    english: catalog.english,
    hindi: catalog.hindi,
    seoKeywords: catalog.seoKeywords,
    hashtags: catalog.hashtags,
    confidence: catalog.confidence / 100,
  };
}

const NOT_PROVIDED = "Not provided";

function findProductValue(
  product: Record<string, string>,
  keys: string[],
): string | undefined {
  for (const [key, rawValue] of Object.entries(product)) {
    const normalizedKey = key
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (
      !keys.some((candidate) =>
        normalizedKey.includes(candidate),
      )
    ) {
      continue;
    }

    const value = String(rawValue ?? "").trim();

    if (
      value &&
      value.toLowerCase() !== NOT_PROVIDED.toLowerCase()
    ) {
      return value;
    }
  }

  return undefined;
}

function findProductNumber(
  product: Record<string, string>,
  keys: string[],
): number | undefined {
  const value = findProductValue(product, keys);

  if (!value) return undefined;

  const match = value.match(/-?\\d+(?:\\.\\d+)?/);

  if (!match) return undefined;

  const numberValue = Number(match[0]);

  return Number.isFinite(numberValue)
    ? numberValue
    : undefined;
}

/**
 * Convert the Cataloger's flexible product object into the
 * strongly typed Craft DNA input expected by merge-catalog.ts.
 *
 * The Cataloger is an artisan-voice evidence layer. We only
 * send values that were actually returned by the cataloger.
 * Missing values stay undefined so existing image-derived DNA
 * is not overwritten.
 */
function catalogToDNAInput(
  catalog: Catalog,
): CatalogDataForDNA {
  const product = catalog.product ?? {};

  const secondaryColoursRaw = findProductValue(
    product,
    [
      "secondarycolours",
      "secondarycolors",
      "colours",
      "colors",
    ],
  );

  const secondaryColours =
    secondaryColoursRaw
      ?.split(/[,;/|]+/)
      .map((item) => item.trim())
      .filter(Boolean);

  const visualCharacteristics = [
    findProductValue(product, [
      "category",
      "craftcategory",
      "crafttype",
      "craft",
    ]),
    findProductValue(product, [
      "producttype",
      "product",
      "type",
      "name",
    ]),
    findProductValue(product, [
      "material",
      "madeof",
      "materialused",
    ]),
    findProductValue(product, [
      "primarycolour",
      "primarycolor",
      "colour",
      "color",
    ]),
    findProductValue(product, ["shape", "form"]),
    findProductValue(product, [
      "pattern",
      "motif",
      "design",
    ]),
    findProductValue(product, [
      "texture",
      "surface",
    ]),
    findProductValue(product, [
      "decoration",
      "decorative",
      "embellishment",
    ]),
  ].filter(
    (value): value is string =>
      Boolean(value),
  );

  return {
    category: findProductValue(product, [
      "category",
      "craftcategory",
      "crafttype",
      "craft",
    ]),
    productType: findProductValue(product, [
      "producttype",
      "product",
      "type",
      "name",
    ]),
    material: findProductValue(product, [
      "material",
      "madeof",
      "materialused",
    ]),
    primaryColour: findProductValue(product, [
      "primarycolour",
      "primarycolor",
      "colour",
      "color",
    ]),
    secondaryColours,
    shape: findProductValue(product, [
      "shape",
      "form",
    ]),
    pattern: findProductValue(product, [
      "pattern",
      "motif",
      "design",
    ]),
    texture: findProductValue(product, [
      "texture",
      "surface",
    ]),
    finish: findProductValue(product, [
      "finish",
      "finishing",
    ]),
    decoration: findProductValue(product, [
      "decoration",
      "decorative",
      "embellishment",
    ]),
    complexity: findProductNumber(product, [
      "complexity",
      "complexityscore",
      "detaillevel",
    ]),
    size: findProductValue(product, [
      "sizelabel",
      "size",
    ]),
    dimensions: findProductValue(product, [
      "dimensions",
      "dimension",
      "measurements",
      "measurement",
    ]),
    useCase: findProductValue(product, [
      "usecase",
      "usage",
      "purpose",
    ]),
    visualCharacteristics,
    confidence: catalog.confidence,
  };
}

function Page() {
  const [language, setLanguage] = useState("");
  const [pipeline, setPipeline] = useState<PipelineState>("idle");
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState("");
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [craftDNA, setCraftDNA] = useState<CraftDNA | null>(null);
  const [tab, setTab] = useState<"Regional" | "English" | "Hindi">("English");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const [dnaUpdated, setDnaUpdated] = useState(false);
  const [sharedImage, setSharedImage] = useState<string | null>(null);
  const [existingDNA, setExistingDNA] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const refreshSharedDraft = () => {
      const next = getCraftDraft();

      setSharedImage(
        next?.image?.enhancedImage ?? null,
      );

      setCraftDNA(next?.craftDNA ?? null);

      setExistingDNA(
        Boolean(next?.craftDNA),
      );
    };

    refreshSharedDraft();

    window.addEventListener(
      "navshakthi:craft-draft-updated",
      refreshSharedDraft,
    );

    window.addEventListener(
      "navshakthi:craft-dna-updated",
      refreshSharedDraft,
    );

    return () => {
      window.removeEventListener(
        "navshakthi:craft-draft-updated",
        refreshSharedDraft,
      );

      window.removeEventListener(
        "navshakthi:craft-dna-updated",
        refreshSharedDraft,
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      recorderRef.current?.stream
        .getTracks()
        .forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startRecording = async () => {
    if (
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      toast.error("Voice recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType =
        preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) ||
        "";

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

        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        setFileName(
          `voice-note.${blob.type.includes("mp4") ? "m4a" : "webm"}`,
        );
        toast.success("Voice note captured");
      };

      recorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      setSeconds(0);
      setTranscript("");
      setCatalog(null);
      setDnaUpdated(false);
      setPipeline("idle");

      timerRef.current = setInterval(() => {
        setSeconds((value) => value + 1);
      }, 1000);
    } catch {
      toast.error(
        "Microphone access was blocked. Please allow microphone access and try again.",
      );
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
    setDnaUpdated(false);
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
      setDnaUpdated(false);
      setPipeline("transcribing");

      const formData = new FormData();
      formData.append(
        "audio",
        audioBlob,
        fileName ||
          (audioBlob.type.includes("mp4")
            ? "voice-note.m4a"
            : "voice-note.webm"),
      );
      formData.append("language", language);

      const transcriptionResponse = await fetch(
        "/api/cataloger/transcribe",
        {
          method: "POST",
          body: formData,
        },
      );

      const transcriptionData = await transcriptionResponse.json();

      if (
        !transcriptionResponse.ok ||
        !transcriptionData.success
      ) {
        throw new Error(
          transcriptionData.error || "Transcription failed.",
        );
      }

      const nextTranscript = String(
        transcriptionData.transcript || "",
      ).trim();

      if (!nextTranscript) {
        throw new Error("No speech was detected in the audio.");
      }

      setTranscript(nextTranscript);
      setPipeline("generating");

      const generationResponse = await fetch(
        "/api/cataloger/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript: nextTranscript,
            language:
              transcriptionData.languageHint || language,
          }),
        },
      );

      const generationData = await generationResponse.json();

      if (
        !generationResponse.ok ||
        !generationData.success
      ) {
        throw new Error(
          generationData.error || "Catalog generation failed.",
        );
      }

      const nextCatalog = normalizeCatalog(
        generationData.catalog,
      );

      const catalogDraft = toCraftCatalogDraft(
        nextCatalog,
        nextTranscript,
      );

      saveCraftCatalog(catalogDraft);

      /*
       * =======================================================
       * SHARED CRAFT DNA INTEGRATION
       * =======================================================
       *
       * Smart Pricing normally creates the initial image-derived
       * Craft DNA. Smart Cataloger then enriches that SAME DNA
       * with artisan-spoken facts.
       *
       * If no DNA exists yet, the merge helper creates a new DNA
       * profile from the catalog evidence. This makes the workflow
       * safe regardless of which module the artisan opens first.
       *
       * Missing/"Not provided" catalog fields do not erase useful
       * existing image-derived values.
       */
      const draft = getCraftDraft();
      const currentDNA = draft?.craftDNA ?? null;
      const dnaInput = catalogToDNAInput(nextCatalog);

      const mergedDNA = mergeCatalogIntoCraftDNA(
        dnaInput,
        currentDNA,
      );

      saveCraftDNA(mergedDNA);
      setCraftDNA(mergedDNA);
      setExistingDNA(true);
      setDnaUpdated(true);

      setCatalog(nextCatalog);
      setTab("English");
      setPipeline("done");

      toast.success(
        currentDNA
          ? "Catalog generated and shared Craft DNA enriched"
          : "Catalog generated and shared Craft DNA created",
      );
    } catch (error) {
      console.error("NAVSHAKTHI Cataloger error:", error);
      setPipeline("idle");
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong.",
      );
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
      craftDNAUpdated: dnaUpdated,
      craftDNA,
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      }),
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
      ? {
          title: `Original transcript · ${catalog.detectedLanguage}`,
          body: transcript,
        }
      : tab === "English"
        ? {
            title: catalog.english.title,
            body: catalog.english.description,
          }
        : {
            title: catalog.hindi.title,
            body: catalog.hindi.description,
          }
    : null;

  const productEntries = catalog
    ? Object.entries(catalog.product).filter(
        ([key]) => key !== "name",
      )
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
        subtitle="Speak about your craft in your own language. NAVSHAKTHI turns the voice note into professional English and Hindi marketplace content while enriching the shared Craft DNA."
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
                  <h2 className="mt-2 font-display text-2xl">
                    Just speak. We handle the listing.
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    Record a short product story or upload an audio note.
                    Known facts enrich the same Craft DNA used by Smart Pricing.
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
                    onChange={(event) =>
                      setLanguage(event.target.value)
                    }
                    disabled={
                      recording || pipeline !== "idle"
                    }
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {LANGS.map((item) => (
                      <option
                        key={item.label}
                        value={item.code}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex cursor-pointer items-end">
                  <span className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold">
                    <Download className="h-4 w-4" />
                    Upload audio
                    <input
                      type="file"
                      accept="audio/*"
                      className="sr-only"
                      disabled={
                        recording || pipeline !== "idle"
                      }
                      onChange={(event) => {
                        const file =
                          event.target.files?.[0];
                        if (file) {
                          handleAudioUpload(file);
                        }
                        event.currentTarget.value = "";
                      }}
                    />
                  </span>
                </label>
              </div>

              {sharedImage && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-background">
                      <img
                        src={sharedImage}
                        alt="Shared enhanced craft"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ImageIcon className="h-4 w-4 text-primary" />
                        Shared enhanced craft image
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Cataloger uses the same craft workflow draft created
                        by AI Image Studio and Smart Pricing.
                      </p>
                    </div>

                    <ArrowRight className="hidden h-5 w-5 text-primary sm:block" />
                  </div>
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-5">
                <div className="flex flex-col items-center justify-center gap-4 py-5 text-center">
                  <button
                    type="button"
                    onClick={
                      recording
                        ? stopRecording
                        : startRecording
                    }
                    disabled={
                      pipeline !== "idle"
                    }
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-full transition ${
                      recording
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-primary text-primary-foreground"
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={
                      recording
                        ? "Stop recording"
                        : "Start recording"
                    }
                  >
                    {recording ? (
                      <Square className="h-6 w-6 fill-current" />
                    ) : (
                      <Mic className="h-7 w-7" />
                    )}
                  </button>

                  <div>
                    <div className="font-display text-lg">
                      {recording
                        ? "Recording voice note…"
                        : "Record a voice note"}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {recording
                        ? formatTime(seconds)
                        : "Describe the product naturally"}
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
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full"
                  />
                  <div className="mt-2 truncate text-xs text-muted-foreground">
                    {fileName}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={generateListing}
                disabled={
                  !audioBlob ||
                  recording ||
                  pipeline !== "idle"
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-earth px-5 py-3.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pipeline !== "idle" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {pipeline === "transcribing"
                  ? "Transcribing…"
                  : pipeline === "generating"
                    ? "Generating marketplace listing…"
                    : "Generate marketplace listing"}
              </button>

              {transcript && (
                <div className="mt-5 rounded-2xl border border-border/60 bg-primary/5 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    AI transcript ·{" "}
                    {catalog?.detectedLanguage ||
                      "detected language"}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {transcript}
                  </p>
                </div>
              )}
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Dna className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Shared intelligence
                  </div>
                  <h2 className="font-display text-xl">
                    Craft DNA continuity
                  </h2>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-muted/40 p-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Existing Craft DNA
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      existingDNA
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {existingDNA
                      ? "Available"
                      : "Not created yet"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Catalog enrichment
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      dnaUpdated
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {dnaUpdated
                      ? "Updated"
                      : "Waiting for generation"}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  "Visual attributes from Smart Pricing are preserved.",
                  "Artisan-spoken facts can improve the existing DNA.",
                  '"Not provided" never erases stronger evidence.',
                  "The same identity can later feed Passport, Twin and Authentication.",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span className="text-sm leading-5 text-muted-foreground">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {catalog && activeListing && (
          <Reveal>
            <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Marketplace output
                  </div>
                  <h2 className="mt-1 font-display text-2xl">
                    Review the generated listing
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyListing}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background px-3 py-2 text-xs font-semibold"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    Copy
                  </button>

                  <button
                    type="button"
                    onClick={exportListing}
                    className="inline-flex items-center gap-1.5 rounded-full bg-earth px-3 py-2 text-xs font-semibold text-cream"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export JSON
                  </button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(["Regional", "English", "Hindi"] as const).map(
                  (item) => (
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
                  ),
                )}
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="rounded-2xl border border-border/60 bg-primary/5 p-5">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {tab === "Regional"
                      ? "Voice transcript"
                      : `Generated ${tab} listing`}
                  </div>

                  <div className="mt-2 font-display text-xl leading-snug">
                    {activeListing.title}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {activeListing.body}
                  </p>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">
                      Extracted product attributes
                    </div>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {Math.round(catalog.confidence)}% confidence
                    </span>
                  </div>

                  {craftDNA && (
                    <div className="mb-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Dna className="h-4 w-4 text-primary" />
                            Shared Craft DNA
                          </div>
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Visual evidence is preserved while artisan-spoken facts
                            refine the same reusable craft identity.
                          </p>
                        </div>

                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          {Math.round(
                            craftDNA.overallConfidence * 100,
                          )}
                          %
                        </span>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {[
                          [
                            "Craft category",
                            craftDNA.craftCategory.value,
                          ],
                          [
                            "Product type",
                            craftDNA.productType.value,
                          ],
                          [
                            "Material",
                            craftDNA.material.value,
                          ],
                          [
                            "Primary colour",
                            craftDNA.primaryColour.value,
                          ],
                          [
                            "Secondary colours",
                            craftDNA.secondaryColours.value.length
                              ? craftDNA.secondaryColours.value.join(", ")
                              : "Not provided",
                          ],
                          [
                            "Shape",
                            craftDNA.shape.value,
                          ],
                          [
                            "Pattern",
                            craftDNA.pattern.value,
                          ],
                          [
                            "Texture",
                            craftDNA.texture.value,
                          ],
                          [
                            "Finish",
                            craftDNA.finish.value,
                          ],
                          [
                            "Dimensions",
                            craftDNA.dimensions.value,
                          ],
                          [
                            "Complexity",
                            `${craftDNA.complexity.value}/10`,
                          ],
                          [
                            "Use case",
                            craftDNA.useCase.value,
                          ],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-border/60 bg-background p-3"
                          >
                            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {label}
                            </div>
                            <div className="mt-1 text-sm font-medium">
                              {value || "Not provided"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {productEntries.length > 0 ? (
                      productEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-2xl border border-border/60 p-4"
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/_/g, " ")
                              .trim()}
                          </div>
                          <div className="mt-1 text-sm font-medium">
                            {value || "Not provided"}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground sm:col-span-2">
                        No structured attributes were returned.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-muted/40 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Hash className="h-4 w-4 text-primary" />
                    SEO keywords
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalog.seoKeywords.length > 0 ? (
                      catalog.seoKeywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-muted/40 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Tags className="h-4 w-4 text-primary" />
                    Hashtags
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {catalog.hashtags.length > 0 ? (
                      catalog.hashtags.map((hashtag) => (
                        <span
                          key={hashtag}
                          className="rounded-full border border-border bg-background px-3 py-1 text-xs"
                        >
                          {hashtag}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Not provided
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {dnaUpdated && (
                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                  <div className="flex items-start gap-3">
                    <Dna className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div>
                      <div className="font-semibold">
                        Shared Craft DNA updated
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        The catalog facts have enriched the same Craft DNA
                        created by the visual analysis. No second craft
                        identity was created.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        )}

        {pipeline !== "idle" && (
          <Reveal>
            <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Processing
                  </div>
                  <h2 className="mt-1 font-display text-xl">
                    Catalog intelligence pipeline
                  </h2>
                </div>

                <div className="text-sm font-semibold text-primary">
                  {pipeline === "done"
                    ? "Complete"
                    : `${currentStep}/6`}
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (currentStep / 6) * 100,
                    )}%`,
                  }}
                />
              </div>

              <ol className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {PIPELINE_STEPS.map((step, index) => {
                  const done =
                    pipeline === "done" ||
                    index < currentStep;

                  return (
                    <li
                      key={step}
                      className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          done
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {step}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </Reveal>
        )}
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              How it works
            </div>
            <h2 className="mt-2 font-display text-3xl">
              From a voice note to a shared craft identity
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, index) => (
            <Reveal
              key={stage.title}
              delay={index * 0.05}
            >
              <div className="h-full rounded-2xl border border-border/60 bg-card p-5">
                <stage.icon className="h-6 w-6 text-primary" />
                <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {index + 1}
                </div>
                <div className="mt-1 font-display text-base">
                  {stage.title}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x py-16">
        <Reveal>
          <div className="max-w-2xl">
            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              Technology
            </div>
            <h2 className="mt-2 font-display text-3xl">
              Built for artisan-first commerce
            </h2>
          </div>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TECH.map((tech, index) => (
            <Reveal
              key={tech.name}
              delay={index * 0.05}
            >
              <div className="h-full rounded-2xl border border-border/60 bg-card p-5">
                <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                  {tech.name}
                </div>
                <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {tech.desc}
                </div>
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
          "Artisans speak in their regional language; AI transcribes, translates and writes marketplace content while enriching a shared Craft DNA.",
      },
      {
        property: "og:title",
        content: "Multilingual Smart Cataloger — NAVSHAKTHI",
      },
      {
        property: "og:description",
        content:
          "Turn a regional-language artisan voice note into a professional marketplace listing and shared craft identity.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});
