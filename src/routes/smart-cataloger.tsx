import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

import {
  PublicPage,
  PageHero,
} from "@/components/public-page";

import { Reveal } from "@/components/section";

import { FeatureCta } from "./ai-image-studio";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  Copy,
  Database,
  Dna,
  Download,
  Globe2,
  Hash,
  Image as ImageIcon,
  Info,
  Languages,
  Loader2,
  Mic,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Square,
  Tags,
  Volume2,
  AlertTriangle,
} from "lucide-react";

import {
  getCraftDraft,
  saveCraftCatalog,
  type CraftCatalogDraft,
} from "@/lib/craft-draft";

import type {
  CraftDNA,
} from "@/lib/craft-dna/types";

import {
  saveCraftDNAVerification,
  type CraftDNAVerificationCheck,
  type CraftDNAVerificationResult,
} from "@/lib/craft-dna/verification";

/* ========================================================================== */
/* CONSTANTS                                                                  */
/* ========================================================================== */

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
  "Checking voice against image-derived Craft DNA",
  "Grounding artisan-provided facts",
  "Generating English and Hindi listings",
  "Saving marketplace-ready catalog data",
  "Ready for artisan review",
];

const STAGES = [
  {
    icon: ImageIcon,
    title: "Image Intelligence creates the visual baseline",
  },
  {
    icon: Dna,
    title: "Image-derived Craft DNA stores the craft identity",
  },
  {
    icon: Mic,
    title: "Artisan speaks naturally in their regional language",
  },
  {
    icon: ShieldCheck,
    title: "Voice is re-verified against the image-derived DNA",
  },
];

const TECH = [
  {
    name: "Image-derived baseline",
    desc:
      "Craft DNA starts from the existing craft image and provides the visual baseline for verification.",
  },
  {
    name: "Gemini transcription",
    desc:
      "Speech is transcribed with language identification for supported Indian languages.",
  },
  {
    name: "Voice re-verification",
    desc:
      "Artisan statements are compared field-by-field against the existing Craft DNA before marketplace content is generated.",
  },
  {
    name: "Grounded extraction",
    desc:
      'Unknown or unsupported facts remain "Not provided" instead of being invented.',
  },
];

const NOT_PROVIDED = "Not provided";

/* ========================================================================== */
/* TYPES                                                                      */
/* ========================================================================== */

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

type PipelineState =
  | "idle"
  | "transcribing"
  | "verifying"
  | "generating"
  | "done";

/* ========================================================================== */
/* HELPERS                                                                    */
/* ========================================================================== */

const formatTime = (
  seconds: number,
) =>
  `${String(
    Math.floor(seconds / 60),
  ).padStart(2, "0")}:${String(
    seconds % 60,
  ).padStart(2, "0")}`;

const preferredMimeTypes = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

function confidencePercent(
  value: number,
) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(
    Math.min(
      1,
      Math.max(0, value),
    ) * 100,
  );
}

function isMissingValue(
  value: string,
) {
  return (
    !value.trim() ||
    value.trim().toLowerCase() ===
      NOT_PROVIDED.toLowerCase()
  );
}

function verificationStatusLabel(
  status: CraftDNAVerificationCheck["status"],
) {
  switch (status) {
    case "match":
      return "Match";

    case "conflict":
      return "Conflict";

    case "new":
      return "New evidence";

    case "insufficient_evidence":
      return "Not mentioned";

    default:
      return "Not mentioned";
  }
}

function verificationStatusClasses(
  status: CraftDNAVerificationCheck["status"],
) {
  switch (status) {
    case "match":
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon:
          "bg-emerald-100 text-emerald-700",
      };

    case "conflict":
      return {
        badge:
          "border-amber-200 bg-amber-50 text-amber-700",
        icon:
          "bg-amber-100 text-amber-700",
      };

    case "new":
      return {
        badge:
          "border-sky-200 bg-sky-50 text-sky-700",
        icon:
          "bg-sky-100 text-sky-700",
      };

    default:
      return {
        badge:
          "border-border bg-muted text-muted-foreground",
        icon:
          "bg-muted text-muted-foreground",
      };
  }
}

/* ========================================================================== */
/* CATALOG NORMALIZATION                                                      */
/* ========================================================================== */

function normalizeCatalog(
  value: unknown,
): Catalog {
  const raw =
    (value ?? {}) as Partial<Catalog>;

  const normalizeListing = (
    item: unknown,
  ) => {
    const listing =
      (item ?? {}) as Partial<
        Catalog["english"]
      >;

    return {
      title: String(
        listing.title ??
          NOT_PROVIDED,
      ),

      description: String(
        listing.description ??
          NOT_PROVIDED,
      ),

      metaDescription: String(
        listing.metaDescription ??
          NOT_PROVIDED,
      ),

      altText: String(
        listing.altText ??
          NOT_PROVIDED,
      ),
    };
  };

  return {
    detectedLanguage: String(
      raw.detectedLanguage ??
        "Unknown",
    ),

    product:
      raw.product &&
      typeof raw.product ===
        "object"
        ? Object.fromEntries(
            Object.entries(
              raw.product,
            ).map(
              ([key, item]) => [
                key,
                String(
                  item ??
                    NOT_PROVIDED,
                ),
              ],
            ),
          )
        : {},

    english:
      normalizeListing(
        raw.english,
      ),

    hindi:
      normalizeListing(
        raw.hindi,
      ),

    seoKeywords:
      Array.isArray(
        raw.seoKeywords,
      )
        ? raw.seoKeywords.map(
            String,
          )
        : [],

    hashtags:
      Array.isArray(
        raw.hashtags,
      )
        ? raw.hashtags.map(
            String,
          )
        : [],

    confidence:
      typeof raw.confidence ===
      "number"
        ? Math.max(
            0,
            Math.min(
              100,
              raw.confidence,
            ),
          )
        : 0,
  };
}

/* ========================================================================== */
/* CATALOG DRAFT                                                              */
/* ========================================================================== */

function toCraftCatalogDraft(
  catalog: Catalog,
  transcript: string,
): CraftCatalogDraft {
  return {
    detectedLanguage:
      catalog.detectedLanguage,

    transcript,

    product:
      catalog.product,

    english:
      catalog.english,

    hindi:
      catalog.hindi,

    seoKeywords:
      catalog.seoKeywords,

    hashtags:
      catalog.hashtags,

    confidence:
      catalog.confidence / 100,
  };
}

/* ========================================================================== */
/* DNA → VERIFICATION REQUEST                                                 */
/* ========================================================================== */

function craftDNAToVerificationInput(
  dna: CraftDNA,
) {
  return {
    craftCategory:
      dna.craftCategory.value,

    productType:
      dna.productType.value,

    material:
      dna.material.value,

    primaryColour:
      dna.primaryColour.value,

    secondaryColours:
      dna.secondaryColours.value,

    shape:
      dna.shape.value,

    pattern:
      dna.pattern.value,

    texture:
      dna.texture.value,

    finish:
      dna.finish.value,

    decoration:
      dna.decoration.value,

    complexity:
      dna.complexity.value,

    size:
      dna.size.value,

    dimensions:
      dna.dimensions.value,

    useCase:
      dna.useCase.value,
  };
}

/* ========================================================================== */
/* VERIFIED CATALOG SOURCE                                                    */
/* ========================================================================== */

/**
 * Creates a grounded source for catalog generation.
 *
 * IMPORTANT:
 *
 * The original transcript is retained for narrative context,
 * but explicit conflicts are resolved in favour of the existing
 * image-derived Craft DNA.
 *
 * This means:
 *
 * IMAGE DNA
 *    ↓
 * verification
 *    ↓
 * grounded catalog source
 *    ↓
 * listing
 *
 * NOT:
 *
 * voice
 *    ↓
 * overwrite DNA
 */
function buildGroundedCatalogSource(
  transcript: string,
  verification:
    | CraftDNAVerificationResult
    | null,
) {
  if (!verification) {
    return transcript;
  }

  const resolvedFacts =
    verification.checks
      .filter(
        (check) =>
          check.status !==
          "insufficient_evidence",
      )
      .map((check) => {
        if (
          check.status ===
          "conflict"
        ) {
          return [
            `${check.label}:`,
            `IMAGE-DERIVED BASELINE = ${check.currentValue}.`,
            `ARTISAN VOICE CLAIM = ${check.voiceClaim}.`,
            `For marketplace content, use the existing image-derived baseline.`,
          ].join(" ");
        }

        if (
          check.status === "match"
        ) {
          return [
            `${check.label}:`,
            `Confirmed against existing Craft DNA = ${check.currentValue}.`,
          ].join(" ");
        }

        return [
          `${check.label}:`,
          `Artisan-reported value = ${check.voiceClaim}.`,
          `This value is not visually confirmed by existing Craft DNA.`,
        ].join(" ");
      });

  return [
    "NAVSHAKTHI VERIFIED CATALOG GROUNDING",
    "",
    "SOURCE PRIORITY:",
    "1. Existing image-derived Craft DNA is the visual baseline.",
    "2. Voice is supporting artisan evidence.",
    "3. Never use a conflicting voice claim to replace an existing image-derived value.",
    "",
    "FIELD-BY-FIELD VERIFICATION:",
    ...resolvedFacts,
    "",
    "ORIGINAL ARTISAN TRANSCRIPT:",
    transcript,
    "",
    "CATALOG GENERATION RULE:",
    "Use the field-by-field verification above as the authoritative grounding context.",
    "For conflicts, use the existing image-derived Craft DNA value.",
    "Do not present an unverified new visual claim as image-confirmed.",
  ].join("\n");
}

/* ========================================================================== */
/* VERIFICATION CARD                                                          */
/* ========================================================================== */

function VerificationCard({
  check,
}: {
  check: CraftDNAVerificationCheck;
}) {
  const styles =
    verificationStatusClasses(
      check.status,
    );

  return (
    <div
      className={`rounded-2xl border p-5 ${
        check.status === "match"
          ? "border-emerald-200 bg-emerald-50/40"
          : check.status ===
              "conflict"
            ? "border-amber-200 bg-amber-50/40"
            : check.status === "new"
              ? "border-sky-200 bg-sky-50/40"
              : "border-border/60 bg-muted/20"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {check.status ===
          "match" ? (
            <Check className="h-4 w-4" />
          ) : check.status ===
            "conflict" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : check.status ===
            "new" ? (
            <PlusCircle className="h-4 w-4" />
          ) : (
            <CircleHelp className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-semibold text-foreground">
                {check.label}
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Evidence confidence{" "}
                {confidencePercent(
                  check.confidence,
                )}
                %
              </div>
            </div>

            <span
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${styles.badge}`}
            >
              {verificationStatusLabel(
                check.status,
              )}
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-border/60 bg-background p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Image-derived Craft DNA
              </div>

              <div
                className={`mt-2 text-sm leading-6 ${
                  isMissingValue(
                    check.currentValue,
                  )
                    ? "italic text-muted-foreground"
                    : "font-medium text-foreground"
                }`}
              >
                {check.currentValue ||
                  NOT_PROVIDED}
              </div>
            </div>

            <div className="rounded-xl border border-border/60 bg-background p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Artisan voice claim
              </div>

              <div
                className={`mt-2 text-sm leading-6 ${
                  isMissingValue(
                    check.voiceClaim,
                  )
                    ? "italic text-muted-foreground"
                    : "font-medium text-foreground"
                }`}
              >
                {check.voiceClaim ||
                  "Not mentioned"}
              </div>
            </div>
          </div>

          {check.status ===
            "conflict" && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                Image baseline retained
              </div>

              <p className="mt-1 text-sm leading-6 text-amber-900">
                The voice claim conflicts with
                the existing image-derived Craft
                DNA. NAVSHAKTHI keeps the
                image-derived value as the
                authoritative visual value.
              </p>

              <div className="mt-3 rounded-lg bg-white/70 p-3">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                  Grounded catalog value
                </div>

                <div className="mt-1 text-sm font-semibold text-amber-950">
                  {check.currentValue}
                </div>
              </div>
            </div>
          )}

          {check.status ===
            "new" && (
            <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-sky-700">
                New artisan evidence
              </div>

              <p className="mt-1 text-sm leading-6 text-sky-900">
                This value was explicitly spoken
                by the artisan but is not present
                in the current Craft DNA. It is
                treated as artisan-reported evidence,
                not as image-confirmed visual truth.
              </p>
            </div>
          )}

          {check.status ===
            "match" && (
            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />

                <span className="text-sm font-semibold text-emerald-900">
                  Voice confirms the existing
                  image-derived value.
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 text-xs leading-5 text-muted-foreground">
            {check.evidence}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* PAGE                                                                       */
/* ========================================================================== */

function Page() {
  const [
    language,
    setLanguage,
  ] = useState("");

  const [
    pipeline,
    setPipeline,
  ] = useState<PipelineState>(
    "idle",
  );

  const [
    recording,
    setRecording,
  ] = useState(false);

  const [
    seconds,
    setSeconds,
  ] = useState(0);

  const [
    audioUrl,
    setAudioUrl,
  ] = useState<string | null>(
    null,
  );

  const [
    audioBlob,
    setAudioBlob,
  ] = useState<Blob | null>(
    null,
  );

  const [
    transcript,
    setTranscript,
  ] = useState("");

  const [
    catalog,
    setCatalog,
  ] = useState<Catalog | null>(
    null,
  );

  const [
    craftDNA,
    setCraftDNA,
  ] = useState<CraftDNA | null>(
    null,
  );

  const [
    verification,
    setVerification,
  ] =
    useState<CraftDNAVerificationResult | null>(
      null,
    );

  const [
    tab,
    setTab,
  ] = useState<
    "Regional" | "English" | "Hindi"
  >("English");

  const [
    copied,
    setCopied,
  ] = useState(false);

  const [
    fileName,
    setFileName,
  ] = useState("");

  const [
    sharedImage,
    setSharedImage,
  ] = useState<string | null>(
    null,
  );

  const [
    existingDNA,
    setExistingDNA,
  ] = useState(false);

  const recorderRef =
    useRef<MediaRecorder | null>(
      null,
    );

  const chunksRef =
    useRef<BlobPart[]>([]);

  const timerRef =
    useRef<
      ReturnType<
        typeof setInterval
      > | null
    >(null);

  /* ======================================================================== */
  /* LOAD SHARED CRAFT WORKFLOW                                               */
  /* ======================================================================== */

  useEffect(() => {
    const refreshSharedDraft =
      () => {
        const draft =
          getCraftDraft();

        const image =
          draft?.image
            ?.enhancedImage ??
          draft?.image
            ?.originalImage ??
          null;

        const dna =
          draft?.craftDNA ??
          null;

        setSharedImage(
          image,
        );

        setCraftDNA(
          dna,
        );

        setExistingDNA(
          Boolean(dna),
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

  /* ======================================================================== */
  /* CLEANUP AUDIO URL                                                        */
  /* ======================================================================== */

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }

      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );
      }
    };
  }, [audioUrl]);

  /* ======================================================================== */
  /* STOP TIMER                                                               */
  /* ======================================================================== */

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(
        timerRef.current,
      );

      timerRef.current = null;
    }
  };

  /* ======================================================================== */
  /* RESET VOICE WORKFLOW                                                      */
  /* ======================================================================== */

  const resetVoiceWorkflow =
    () => {
      stopTimer();

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }

      setAudioUrl(null);
      setAudioBlob(null);
      setFileName("");
      setTranscript("");
      setCatalog(null);
      setVerification(null);
      setPipeline("idle");
      setRecording(false);
      setSeconds(0);
      setTab("English");
    };

  /* ======================================================================== */
  /* START RECORDING                                                           */
  /* ======================================================================== */

  const startRecording =
    async () => {
      if (
        pipeline !== "idle"
      ) {
        return;
      }

      if (
        typeof navigator ===
          "undefined" ||
        !navigator.mediaDevices
          ?.getUserMedia
      ) {
        toast.error(
          "Microphone recording is not supported in this browser.",
        );

        return;
      }

      try {
        const stream =
          await navigator.mediaDevices.getUserMedia(
            {
              audio: true,
            },
          );

        const mimeType =
          preferredMimeTypes.find(
            (type) =>
              MediaRecorder.isTypeSupported(
                type,
              ),
          ) || "";

        const recorder =
          mimeType
            ? new MediaRecorder(
                stream,
                {
                  mimeType,
                },
              )
            : new MediaRecorder(
                stream,
              );

        chunksRef.current =
          [];

        recorder.ondataavailable =
          (event) => {
            if (
              event.data.size >
              0
            ) {
              chunksRef.current.push(
                event.data,
              );
            }
          };

        recorder.onstop = () => {
          const blob =
            new Blob(
              chunksRef.current,
              {
                type:
                  recorder.mimeType ||
                  "audio/webm",
              },
            );

          stream
            .getTracks()
            .forEach(
              (track) =>
                track.stop(),
            );

          setAudioBlob(
            blob,
          );

          setAudioUrl(
            URL.createObjectURL(
              blob,
            ),
          );

          setFileName(
            `voice-note.${
              blob.type.includes(
                "mp4",
              )
                ? "m4a"
                : "webm"
            }`,
          );

          toast.success(
            "Voice note captured",
          );
        };

        recorderRef.current =
          recorder;

        recorder.start(250);

        setRecording(
          true,
        );

        setSeconds(0);

        setTranscript("");
        setCatalog(null);
        setVerification(null);

        setPipeline(
          "idle",
        );

        timerRef.current =
          setInterval(() => {
            setSeconds(
              (value) =>
                value + 1,
            );
          }, 1000);
      } catch {
        toast.error(
          "Microphone access was blocked. Please allow microphone access and try again.",
        );
      }
    };

  /* ======================================================================== */
  /* STOP RECORDING                                                            */
  /* ======================================================================== */

  const stopRecording =
    () => {
      if (
        !recorderRef.current
      ) {
        return;
      }

      recorderRef.current.stop();

      recorderRef.current =
        null;

      stopTimer();

      setRecording(
        false,
      );
    };

  /* ======================================================================== */
  /* AUDIO UPLOAD                                                              */
  /* ======================================================================== */

  const handleAudioUpload =
    (file: File) => {
      if (
        !file.type.startsWith(
          "audio/",
        )
      ) {
        toast.error(
          "Please choose an audio file.",
        );

        return;
      }

      if (
        file.size >
        8 * 1024 * 1024
      ) {
        toast.error(
          "Audio file must be 8 MB or smaller.",
        );

        return;
      }

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }

      setAudioBlob(
        file,
      );

      setAudioUrl(
        URL.createObjectURL(
          file,
        ),
      );

      setFileName(
        file.name,
      );

      setTranscript("");
      setCatalog(null);
      setVerification(null);
      setPipeline("idle");
      setSeconds(0);

      toast.success(
        "Audio file ready",
      );
    };

  /* ======================================================================== */
  /* VOICE VERIFICATION                                                        */
  /* ======================================================================== */

  const verifyVoiceAgainstDNA =
    async (
      nextTranscript: string,
      detectedLanguage: string,
      dna: CraftDNA,
    ): Promise<
      CraftDNAVerificationResult | null
    > => {
      try {
        const response =
          await fetch(
            "/api/craft-dna/verify",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                transcript:
                  nextTranscript,

                language:
                  detectedLanguage ||
                  language ||
                  "auto",

                craftDNA:
                  craftDNAToVerificationInput(
                    dna,
                  ),
              }),
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Voice verification failed.",
          );
        }

        const result =
          data.result as CraftDNAVerificationResult;

        const normalizedResult: CraftDNAVerificationResult =
          {
            ...result,

            transcript:
              nextTranscript,

            language:
              detectedLanguage ||
              language ||
              "auto",

            verifiedAt:
              new Date().toISOString(),
          };

        saveCraftDNAVerification(
          normalizedResult,
        );

        setVerification(
          normalizedResult,
        );

        return normalizedResult;
      } catch (error) {
        console.error(
          "NAVSHAKTHI voice verification error:",
          error,
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Voice verification failed.",
        );

        return null;
      }
    };

  /* ======================================================================== */
  /* GENERATE LISTING                                                          */
  /* ======================================================================== */

  const generateListing =
    async () => {
      if (!audioBlob) {
        toast.error(
          "Record or upload a voice note first.",
        );

        return;
      }

      if (
        audioBlob.size >
        8 * 1024 * 1024
      ) {
        toast.error(
          "Audio file must be 8 MB or smaller.",
        );

        return;
      }

      /*
       * IMPORTANT:
       *
       * Smart Cataloger now requires an existing Craft DNA.
       *
       * That forces the intended architecture:
       *
       * IMAGE → DNA → VOICE → VERIFY
       *
       * instead of:
       *
       * VOICE → create/overwrite DNA
       */
      const draftAtStart =
        getCraftDraft();

      const imageDerivedDNA =
        draftAtStart?.craftDNA ??
        null;

      if (!imageDerivedDNA) {
        toast.error(
          "Please complete Image Intelligence first so the voice can be checked against the image-derived Craft DNA.",
        );

        return;
      }

      if (
        !draftAtStart?.image
          ?.enhancedImage &&
        !draftAtStart?.image
          ?.originalImage
      ) {
        toast.error(
          "Please upload and analyze the craft image first.",
        );

        return;
      }

      try {
        setCatalog(null);
        setTranscript("");
        setVerification(null);
        setPipeline(
          "transcribing",
        );

        /* ================================================================
           1. TRANSCRIPTION
        ================================================================= */

        const formData =
          new FormData();

        formData.append(
          "audio",
          audioBlob,
          fileName ||
            (audioBlob.type.includes(
              "mp4",
            )
              ? "voice-note.m4a"
              : "voice-note.webm"),
        );

        formData.append(
          "language",
          language,
        );

        const transcriptionResponse =
          await fetch(
            "/api/cataloger/transcribe",
            {
              method: "POST",
              body: formData,
            },
          );

        const transcriptionData =
          await transcriptionResponse.json();

        if (
          !transcriptionResponse.ok ||
          !transcriptionData.success
        ) {
          throw new Error(
            transcriptionData.error ||
              "Transcription failed.",
          );
        }

        const nextTranscript =
          String(
            transcriptionData.transcript ||
              "",
          ).trim();

        if (
          !nextTranscript
        ) {
          throw new Error(
            "No speech was detected in the audio.",
          );
        }

        const detectedLanguage =
          String(
            transcriptionData.languageHint ||
              language ||
              "Unknown",
          );

        setTranscript(
          nextTranscript,
        );

        /* ================================================================
           2. IMAGE-DERIVED DNA VERIFICATION
        ================================================================= */

        setPipeline(
          "verifying",
        );

        const verificationResult =
          await verifyVoiceAgainstDNA(
            nextTranscript,
            detectedLanguage,
            imageDerivedDNA,
          );

        if (
          !verificationResult
        ) {
          throw new Error(
            "Voice verification could not be completed. The marketplace listing was not generated without verification.",
          );
        }

        /* ================================================================
           3. GROUNDED CATALOG SOURCE
        ================================================================= */

        const groundedCatalogSource =
          buildGroundedCatalogSource(
            nextTranscript,
            verificationResult,
          );

        /* ================================================================
           4. CATALOG GENERATION
        ================================================================= */

        setPipeline(
          "generating",
        );

        const generationResponse =
          await fetch(
            "/api/cataloger/generate",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                /*
                 * DO NOT send only the raw transcript.
                 *
                 * The catalog generator receives the
                 * verification-grounded source so conflicting
                 * voice claims do not become unverified
                 * marketplace attributes.
                 */
                transcript:
                  groundedCatalogSource,

                language:
                  detectedLanguage,
              }),
            },
          );

        const generationData =
          await generationResponse.json();

        if (
          !generationResponse.ok ||
          !generationData.success
        ) {
          throw new Error(
            generationData.error ||
              "Catalog generation failed.",
          );
        }

        const nextCatalog =
          normalizeCatalog(
            generationData.catalog,
          );

        /* ================================================================
           5. SAVE CATALOG
        ================================================================= */

        const catalogDraft =
          toCraftCatalogDraft(
            nextCatalog,
            nextTranscript,
          );

        saveCraftCatalog(
          catalogDraft,
        );

        /*
         * CRITICAL:
         *
         * Do NOT call:
         *
         * mergeCatalogIntoCraftDNA(...)
         *
         * here.
         *
         * The catalog is generated from voice evidence.
         * Automatically merging it into Craft DNA would
         * effectively create:
         *
         * VOICE → DNA
         *
         * which is exactly what we do NOT want.
         *
         * Craft DNA remains the existing image-derived
         * baseline until an explicit downstream human
         * review/edit changes it.
         */

        setCraftDNA(
          imageDerivedDNA,
        );

        setExistingDNA(
          true,
        );

        setCatalog(
          nextCatalog,
        );

        setTab(
          "English",
        );

        setPipeline(
          "done",
        );

        const conflicts =
          verificationResult.checks.filter(
            (check) =>
              check.status ===
              "conflict",
          ).length;

        if (
          conflicts > 0
        ) {
          toast.success(
            `Listing generated with ${conflicts} voice conflict${
              conflicts === 1
                ? ""
                : "s"
            } checked against the image-derived Craft DNA.`,
          );
        } else {
          toast.success(
            "Listing generated after checking voice against the image-derived Craft DNA.",
          );
        }
      } catch (error) {
        console.error(
          "NAVSHAKTHI Cataloger error:",
          error,
        );

        setPipeline(
          "idle",
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong.",
        );
      }
    };

  /* ======================================================================== */
  /* COPY LISTING                                                              */
  /* ======================================================================== */

  const copyListing =
    async () => {
      if (!catalog) {
        return;
      }

      const content =
        tab === "Regional"
          ? transcript
          : tab === "English"
            ? `${catalog.english.title}\n\n${catalog.english.description}`
            : `${catalog.hindi.title}\n\n${catalog.hindi.description}`;

      try {
        await navigator.clipboard.writeText(
          `${content}\n\nKeywords: ${catalog.seoKeywords.join(
            ", ",
          )}\nHashtags: ${catalog.hashtags.join(
            " ",
          )}`,
        );

        setCopied(
          true,
        );

        toast.success(
          "Listing copied",
        );

        window.setTimeout(
          () =>
            setCopied(false),
          1600,
        );
      } catch {
        toast.error(
          "Could not copy the listing.",
        );
      }
    };

  /* ======================================================================== */
  /* EXPORT                                                                    */
  /* ======================================================================== */

  const exportListing =
    () => {
      if (!catalog) {
        return;
      }

      const payload = {
        sourceLanguage:
          catalog.detectedLanguage,

        transcript,

        product:
          catalog.product,

        english:
          catalog.english,

        hindi:
          catalog.hindi,

        seoKeywords:
          catalog.seoKeywords,

        hashtags:
          catalog.hashtags,

        confidence:
          catalog.confidence,

        craftDNAUpdated:
          false,

        craftDNA,

        voiceVerification:
          verification,

        sourceOfTruth:
          "image-derived Craft DNA",

        verificationMode:
          "voice re-verification against existing image-derived Craft DNA",
      };

      const url =
        URL.createObjectURL(
          new Blob(
            [
              JSON.stringify(
                payload,
                null,
                2,
              ),
            ],
            {
              type: "application/json",
            },
          ),
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href =
        url;

      anchor.download =
        "navshakthi-marketplace-listing.json";

      anchor.click();

      URL.revokeObjectURL(
        url,
      );

      toast.success(
        "Marketplace JSON exported",
      );
    };

  /* ======================================================================== */
  /* ACTIVE LISTING                                                            */
  /* ======================================================================== */

  const activeListing =
    catalog
      ? tab === "Regional"
        ? {
            title: `Original transcript · ${catalog.detectedLanguage}`,
            body: transcript,
          }
        : tab === "English"
          ? {
              title:
                catalog.english
                  .title,

              body:
                catalog.english
                  .description,
            }
          : {
              title:
                catalog.hindi
                  .title,

              body:
                catalog.hindi
                  .description,
            }
      : null;

  const productEntries =
    catalog
      ? Object.entries(
          catalog.product,
        ).filter(
          ([key]) =>
            key !== "name",
        )
      : [];

  const currentStep =
    pipeline ===
    "transcribing"
      ? 1
      : pipeline ===
          "verifying"
        ? 3
        : pipeline ===
            "generating"
          ? 5
          : pipeline ===
              "done"
            ? 7
            : 0;

  const matchCount =
    verification?.checks.filter(
      (check) =>
        check.status ===
        "match",
    ).length ?? 0;

  const conflictCount =
    verification?.checks.filter(
      (check) =>
        check.status ===
        "conflict",
    ).length ?? 0;

  const newEvidenceCount =
    verification?.checks.filter(
      (check) =>
        check.status ===
        "new",
    ).length ?? 0;

  const notMentionedCount =
    verification?.checks.filter(
      (check) =>
        check.status ===
        "insufficient_evidence",
    ).length ?? 0;

  /* ======================================================================== */
  /* UI                                                                        */
  /* ======================================================================== */

  return (
    <PublicPage>
      <PageHero
        eyebrow="AI commerce"
        title="Multilingual Smart Cataloger"
        subtitle="Start from the craft image. NAVSHAKTHI checks the artisan's regional-language voice against the existing image-derived Craft DNA before generating marketplace content."
      />

      <section className="container-x pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">

          {/* ==================================================================
              LEFT — VOICE INPUT
          ================================================================== */}

          <Reveal>
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-sm">

              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Try the cataloger
                  </div>

                  <h2 className="mt-2 font-display text-2xl">
                    Image first. Then speak.
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
                    The existing image-derived Craft DNA
                    is the baseline. Your voice note is
                    checked against it before marketplace
                    content is generated.
                  </p>
                </div>

                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Globe2 className="h-5 w-5" />
                </div>
              </div>

              {/* --------------------------------------------------------------
                  SHARED IMAGE
              -------------------------------------------------------------- */}

              {sharedImage && (
                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-4">

                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-border bg-background">
                      <img
                        src={
                          sharedImage
                        }
                        alt="Image-derived craft baseline"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ImageIcon className="h-4 w-4 text-primary" />

                        Image-derived visual baseline
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        This is the same craft image
                        retained across Image Intelligence,
                        Smart Pricing and Smart Cataloger.
                      </p>
                    </div>

                    <ArrowRight className="hidden h-5 w-5 text-primary sm:block" />
                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------
                  DNA STATUS
              -------------------------------------------------------------- */}

              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">

                  <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center gap-2">

                      <div className="text-sm font-semibold">
                        Image-derived Craft DNA
                      </div>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          existingDNA
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {existingDNA
                          ? "Ready"
                          : "Required"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {existingDNA
                        ? "Voice will be checked against this existing image-derived identity. Voice conflicts do not automatically overwrite it."
                        : "Complete Image Intelligence first. Smart Cataloger uses the resulting Craft DNA as the verification baseline."}
                    </p>

                  </div>
                </div>
              </div>

              {/* --------------------------------------------------------------
                  LANGUAGE
              -------------------------------------------------------------- */}

              <div className="mt-6">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Voice language
                  </span>

                  <select
                    value={language}
                    onChange={(event) =>
                      setLanguage(
                        event.target.value,
                      )
                    }
                    disabled={
                      recording ||
                      pipeline !==
                        "idle"
                    }
                    className="w-full rounded-xl border border-border/60 bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {LANGS.map(
                      (item) => (
                        <option
                          key={
                            item.label
                          }
                          value={
                            item.code
                          }
                        >
                          {
                            item.label
                          }
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>

              {/* --------------------------------------------------------------
                  RECORDING
              -------------------------------------------------------------- */}

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
                      pipeline !==
                      "idle"
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
                        ? formatTime(
                            seconds,
                          )
                        : "Describe the product naturally"}
                    </div>
                  </div>

                </div>
              </div>

              {/* --------------------------------------------------------------
                  AUDIO UPLOAD
              -------------------------------------------------------------- */}

              <div className="mt-4 flex flex-wrap gap-3">

                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted">
                  <Download className="h-4 w-4" />

                  Upload audio

                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    disabled={
                      pipeline !==
                      "idle"
                    }
                    onChange={(
                      event,
                    ) => {
                      const file =
                        event
                          .target
                          .files?.[0];

                      if (file) {
                        handleAudioUpload(
                          file,
                        );
                      }

                      event.currentTarget.value =
                        "";
                    }}
                  />
                </label>

                {(audioBlob ||
                  transcript ||
                  catalog ||
                  verification) && (
                  <button
                    type="button"
                    onClick={
                      resetVoiceWorkflow
                    }
                    disabled={
                      pipeline !==
                      "idle"
                    }
                    className="inline-flex items-center gap-2 rounded-xl border border-border/60 bg-background px-4 py-3 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                  >
                    Reset
                  </button>
                )}

              </div>

              {/* --------------------------------------------------------------
                  AUDIO PLAYER
              -------------------------------------------------------------- */}

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

              {/* --------------------------------------------------------------
                  GENERATE
              -------------------------------------------------------------- */}

              <button
                type="button"
                onClick={
                  generateListing
                }
                disabled={
                  !audioBlob ||
                  recording ||
                  pipeline !==
                    "idle" ||
                  !existingDNA
                }
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-earth px-5 py-3.5 text-sm font-semibold text-cream transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pipeline !==
                "idle" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}

                {pipeline ===
                "transcribing"
                  ? "Transcribing…"
                  : pipeline ===
                      "verifying"
                    ? "Checking against image-derived DNA…"
                    : pipeline ===
                        "generating"
                      ? "Generating marketplace listing…"
                      : "Verify & generate marketplace listing"}
              </button>

              {!existingDNA && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                  Complete Image Intelligence first.
                  Voice re-verification is intentionally
                  unavailable until an image-derived Craft
                  DNA baseline exists.
                </div>
              )}

              {/* --------------------------------------------------------------
                  TRANSCRIPT
              -------------------------------------------------------------- */}

              {transcript && (
                <div className="mt-5 rounded-2xl border border-border/60 bg-primary/5 p-4">

                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Original AI transcript ·{" "}
                    {catalog?.detectedLanguage ||
                      verification?.language ||
                      "detected language"}
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                    {transcript}
                  </p>

                </div>
              )}
            </div>
          </Reveal>

          {/* ==================================================================
              RIGHT — SHARED DNA
          ================================================================== */}

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

              {/* --------------------------------------------------------------
                  DNA SUMMARY
              -------------------------------------------------------------- */}

              <div className="mt-5 rounded-2xl bg-muted/40 p-5">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Image-derived Craft DNA
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
                      : "Required"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    Voice re-verification
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      verification
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {verification
                      ? "Completed"
                      : "Waiting"}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-sm text-muted-foreground">
                    DNA modification by voice
                  </span>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Protected
                  </span>
                </div>

              </div>

              {/* --------------------------------------------------------------
                  DNA VALUES
              -------------------------------------------------------------- */}

              {craftDNA && (
                <div className="mt-5">

                  <div className="mb-3 flex items-center justify-between gap-4">
                    <div className="text-sm font-semibold">
                      Current image-derived identity
                    </div>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {confidencePercent(
                        craftDNA.overallConfidence,
                      )}
                      %
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    {[
                      [
                        "Craft category",
                        craftDNA
                          .craftCategory
                          .value,
                      ],

                      [
                        "Product type",
                        craftDNA
                          .productType
                          .value,
                      ],

                      [
                        "Material",
                        craftDNA
                          .material
                          .value,
                      ],

                      [
                        "Primary colour",
                        craftDNA
                          .primaryColour
                          .value,
                      ],

                      [
                        "Shape",
                        craftDNA
                          .shape
                          .value,
                      ],

                      [
                        "Pattern",
                        craftDNA
                          .pattern
                          .value,
                      ],

                      [
                        "Texture",
                        craftDNA
                          .texture
                          .value,
                      ],

                      [
                        "Finish",
                        craftDNA
                          .finish
                          .value,
                      ],

                      [
                        "Dimensions",
                        craftDNA
                          .dimensions
                          .value,
                      ],

                      [
                        "Use case",
                        craftDNA
                          .useCase
                          .value,
                      ],
                    ].map(
                      ([
                        label,
                        value,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          className="rounded-xl border border-border/60 bg-background p-3"
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {label}
                          </div>

                          <div className="mt-1 text-sm font-medium">
                            {value ||
                              NOT_PROVIDED}
                          </div>
                        </div>
                      ),
                    )}

                  </div>
                </div>
              )}

              {/* --------------------------------------------------------------
                  PRINCIPLES
              -------------------------------------------------------------- */}

              <div className="mt-5 space-y-3">

                {[
                  "The existing craft image creates the visual baseline.",
                  "Voice is used as a re-verification and evidence layer.",
                  "Conflicting voice claims never silently overwrite the image-derived DNA.",
                  "New voice evidence remains clearly marked as artisan-reported.",
                  "The same Craft DNA can continue into Pricing, Planner, Craft Lab and Marketplace.",
                ].map(
                  (item) => (
                    <div
                      key={item}
                      className="flex gap-3 rounded-xl border border-border/60 p-3"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

                      <span className="text-sm leading-5 text-muted-foreground">
                        {item}
                      </span>
                    </div>
                  ),
                )}

              </div>

            </div>
          </Reveal>
        </div>

        {/* ====================================================================
            PIPELINE
        ==================================================================== */}

        {pipeline !==
          "idle" && (
          <Reveal>
            <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">

              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Processing pipeline
                  </div>

                  <h2 className="mt-1 font-display text-xl">
                    Image → DNA → Voice → Verification → Catalog
                  </h2>
                </div>

                <div className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                  {currentStep}/
                  {PIPELINE_STEPS.length}
                </div>
              </div>

              <ol className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">

                {PIPELINE_STEPS.map(
                  (
                    step,
                    index,
                  ) => {
                    const stepNumber =
                      index + 1;

                    const done =
                      pipeline ===
                        "done"
                        ? true
                        : currentStep >
                          stepNumber;

                    const active =
                      currentStep ===
                      stepNumber;

                    return (
                      <li
                        key={
                          step
                        }
                        className={`flex items-center gap-3 rounded-xl border p-3 ${
                          active
                            ? "border-primary/30 bg-primary/5"
                            : "border-border/60 bg-background"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            done ||
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {done ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            stepNumber
                          )}
                        </span>

                        <span className="text-sm text-muted-foreground">
                          {step}
                        </span>
                      </li>
                    );
                  },
                )}

              </ol>
            </div>
          </Reveal>
        )}

        {/* ====================================================================
            VERIFICATION RESULTS
        ==================================================================== */}

        {verification && (
          <Reveal>
            <section className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">

              <div className="flex flex-wrap items-end justify-between gap-5">

                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                    Voice re-verification
                  </div>

                  <h2 className="mt-1 font-display text-2xl">
                    Voice checked against image-derived DNA
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    The existing Craft DNA remains the
                    visual baseline. Conflicts are surfaced
                    instead of silently changing the craft
                    identity.
                  </p>
                </div>

                <div
                  className={`rounded-2xl border px-4 py-3 ${
                    verification.overallStatus ===
                    "aligned"
                      ? "border-emerald-200 bg-emerald-50"
                      : verification.overallStatus ===
                          "needs_review"
                        ? "border-amber-200 bg-amber-50"
                        : "border-border/60 bg-muted"
                  }`}
                >
                  <div className="text-xs font-semibold text-muted-foreground">
                    Verification confidence
                  </div>

                  <div className="mt-1 text-2xl font-semibold text-foreground">
                    {confidencePercent(
                      verification.overallConfidence,
                    )}
                    %
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------------------
                  COUNTERS
              ---------------------------------------------------------------- */}

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700">
                    Match
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-emerald-800">
                    {matchCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-amber-700">
                    Conflict
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-amber-800">
                    {conflictCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-sky-700">
                    New evidence
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-sky-800">
                    {newEvidenceCount}
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Not mentioned
                  </div>

                  <div className="mt-2 text-2xl font-semibold text-foreground">
                    {notMentionedCount}
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------------------
                  SUMMARY
              ---------------------------------------------------------------- */}

              <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">

                <div className="flex items-start gap-3">

                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <div>

                    <div className="text-sm font-semibold">
                      Verification summary
                    </div>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {verification.summary}
                    </p>

                  </div>

                </div>

              </div>

              {/* ----------------------------------------------------------------
                  FIELD CHECKS
              ---------------------------------------------------------------- */}

              <div className="mt-6 space-y-3">

                {verification.checks.map(
                  (check) => (
                    <VerificationCard
                      key={
                        check.field
                      }
                      check={
                        check
                      }
                    />
                  ),
                )}

              </div>

              {/* ----------------------------------------------------------------
                  IMPORTANT ARCHITECTURE NOTICE
              ---------------------------------------------------------------- */}

              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                <div className="flex items-start gap-3">

                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                  <div>

                    <div className="font-semibold text-emerald-900">
                      Image-derived Craft DNA is protected
                    </div>

                    <p className="mt-1 text-sm leading-6 text-emerald-800/80">
                      Voice verification does not
                      automatically modify the shared Craft
                      DNA. Conflicting spoken values are
                      grounded back to the existing image-derived
                      value for marketplace content.
                    </p>

                  </div>

                </div>

              </div>

              {/* ----------------------------------------------------------------
                  TRANSPARENCY
              ---------------------------------------------------------------- */}

              <div className="mt-6 rounded-2xl border border-border/60 bg-muted/20 p-5">

                <div className="flex items-start gap-3">

                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />

                  <div>

                    <h3 className="text-sm font-semibold">
                      Evidence comparison, not certification
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      NAVSHAKTHI compares artisan-provided
                      voice statements with the existing
                      image-derived Craft DNA. This is a
                      consistency and evidence-review layer;
                      it is not legal authentication,
                      certification or proof of origin.
                    </p>

                  </div>

                </div>

              </div>

            </section>
          </Reveal>
        )}

        {/* ====================================================================
            MARKETPLACE OUTPUT
        ==================================================================== */}

        {catalog &&
          activeListing && (
            <Reveal>
              <section className="mt-8 rounded-3xl border border-border/60 bg-card p-6 shadow-sm">

                <div className="flex flex-wrap items-center justify-between gap-4">

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                      Marketplace output
                    </div>

                    <h2 className="mt-1 font-display text-2xl">
                      Verified craft listing
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Generated after voice evidence was
                      checked against the image-derived Craft
                      DNA.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">

                    <button
                      type="button"
                      onClick={
                        copyListing
                      }
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
                      onClick={
                        exportListing
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-earth px-3 py-2 text-xs font-semibold text-cream"
                    >
                      <Download className="h-3.5 w-3.5" />

                      Export JSON
                    </button>

                  </div>

                </div>

                {/* ----------------------------------------------------------------
                    TABS
                ---------------------------------------------------------------- */}

                <div className="mt-6 flex flex-wrap gap-2">

                  {(
                    [
                      "Regional",
                      "English",
                      "Hindi",
                    ] as const
                  ).map(
                    (item) => (
                      <button
                        key={
                          item
                        }
                        type="button"
                        onClick={() =>
                          setTab(
                            item,
                          )
                        }
                        className={`rounded-full px-4 py-2 text-xs font-semibold ${
                          tab ===
                          item
                            ? "bg-primary text-primary-foreground"
                            : "border border-border/60 bg-background"
                        }`}
                      >
                        {item}
                      </button>
                    ),
                  )}

                </div>

                {/* ----------------------------------------------------------------
                    OUTPUT GRID
                ---------------------------------------------------------------- */}

                <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_0.9fr]">

                  <div className="rounded-2xl border border-border/60 bg-primary/5 p-5">

                    <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {tab ===
                      "Regional"
                        ? "Original voice transcript"
                        : `Generated ${tab} listing`}
                    </div>

                    <div className="mt-2 font-display text-xl leading-snug">
                      {
                        activeListing.title
                      }
                    </div>

                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                      {
                        activeListing.body
                      }
                    </p>

                  </div>

                  <div>

                    <div className="mb-3 flex items-center justify-between gap-4">

                      <div className="text-sm font-semibold">
                        Extracted product attributes
                      </div>

                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        {Math.round(
                          catalog.confidence,
                        )}
                        % confidence
                      </span>

                    </div>

                    <div className="space-y-2">

                      {productEntries.map(
                        ([
                          key,
                          value,
                        ]) => (
                          <div
                            key={
                              key
                            }
                            className="rounded-xl border border-border/60 bg-background p-3"
                          >

                            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {key
                                .replaceAll(
                                  "_",
                                  " ",
                                )
                                .replace(
                                  /\b\w/g,
                                  (
                                    character,
                                  ) =>
                                    character.toUpperCase(),
                                )}
                            </div>

                            <div className="mt-1 text-sm leading-5">
                              {value}
                            </div>

                          </div>
                        ),
                      )}

                    </div>

                  </div>

                </div>

                {/* ----------------------------------------------------------------
                    VERIFICATION GROUNDING NOTICE
                ---------------------------------------------------------------- */}

                <div className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">

                  <div className="flex items-start gap-3">

                    <Dna className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>

                      <div className="text-sm font-semibold">
                        Listing grounded by shared Craft DNA
                      </div>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Existing image-derived values remain
                        the visual baseline. Any conflicting
                        voice claim was treated as a conflict
                        instead of silently changing the craft
                        identity.
                      </p>

                    </div>

                  </div>

                </div>

              </section>
            </Reveal>
          )}

      </section>

      {/* ======================================================================
          HOW IT WORKS
      ====================================================================== */}

      <section className="container-x py-16">

        <Reveal>

          <div className="max-w-2xl">

            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              How it works
            </div>

            <h2 className="mt-2 font-display text-3xl">
              Image first. Voice second. Evidence stays grounded.
            </h2>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              NAVSHAKTHI does not let a voice note silently
              redefine the visual identity of a craft.
            </p>

          </div>

        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {STAGES.map(
            (
              stage,
              index,
            ) => (
              <Reveal
                key={
                  stage.title
                }
                delay={
                  index *
                  0.05
                }
              >

                <div className="h-full rounded-2xl border border-border/60 bg-card p-5">

                  <stage.icon className="h-6 w-6 text-primary" />

                  <div className="mt-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    Step{" "}
                    {index + 1}
                  </div>

                  <div className="mt-1 font-display text-base">
                    {
                      stage.title
                    }
                  </div>

                </div>

              </Reveal>
            ),
          )}

        </div>

      </section>

      {/* ======================================================================
          TECHNOLOGY
      ====================================================================== */}

      <section className="container-x py-16">

        <Reveal>

          <div className="max-w-2xl">

            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              Technology
            </div>

            <h2 className="mt-2 font-display text-3xl">
              Built for grounded artisan-first commerce
            </h2>

          </div>

        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {TECH.map(
            (
              tech,
              index,
            ) => (
              <Reveal
                key={
                  tech.name
                }
                delay={
                  index *
                  0.05
                }
              >

                <div className="h-full rounded-2xl border border-border/60 bg-card p-5">

                  <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {
                      tech.name
                    }
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {
                      tech.desc
                    }
                  </div>

                </div>

              </Reveal>
            ),
          )}

        </div>

      </section>

      {/* ======================================================================
          FOOTER CTA
      ====================================================================== */}

      <FeatureCta
        heading="No typing. No English required. Just speak."
        icon={Globe2}
        secondary="See sample listings"
      />

    </PublicPage>
  );
}

/* ========================================================================== */
/* ROUTE                                                                      */
/* ========================================================================== */

export const Route =
  createFileRoute(
    "/smart-cataloger",
  )({
    head: () => ({
      meta: [
        {
          title:
            "Multilingual Smart Cataloger — NAVSHAKTHI",
        },

        {
          name: "description",
          content:
            "NAVSHAKTHI checks regional-language artisan voice against image-derived Craft DNA before generating marketplace content.",
        },

        {
          property:
            "og:title",
          content:
            "Multilingual Smart Cataloger — NAVSHAKTHI",
        },

        {
          property:
            "og:description",
          content:
            "Image-derived Craft DNA first, followed by voice re-verification and grounded marketplace generation.",
        },

        {
          property:
            "og:type",
          content:
            "website",
        },

        {
          name:
            "twitter:card",
          content:
            "summary_large_image",
        },
      ],
    }),

    component: Page,
  });