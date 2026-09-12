import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  CircleHelp,
  Database,
  FileAudio,
  Info,
  Loader2,
  Mic,
  Play,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

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

import {
  getCraftDNA as getStoredCraftDNA,
  saveCraftDNA as saveStoredCraftDNA,
} from "@/lib/craft-dna/storage";

import {
  getCraftDraft,
  saveCraftDNA as saveDraftCraftDNA,
} from "@/lib/craft-draft";

import type {
  CraftDNA,
} from "@/lib/craft-dna/types";

import {
  saveCraftDNAVerification,
  type CraftDNAVerificationCheck,
  type CraftDNAVerificationField,
  type CraftDNAVerificationResult,
} from "@/lib/craft-dna/verification";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const LANGUAGES = [
  { label: "Auto Detect", value: "" },
  { label: "Tamil", value: "Tamil" },
  { label: "Hindi", value: "Hindi" },
  { label: "Telugu", value: "Telugu" },
  { label: "Kannada", value: "Kannada" },
  { label: "Malayalam", value: "Malayalam" },
  { label: "Bengali", value: "Bengali" },
  { label: "Marathi", value: "Marathi" },
  { label: "Gujarati", value: "Gujarati" },
  { label: "English", value: "English" },
] as const;

const PREFERRED_MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function confidencePercent(
  value: number,
) {
  return Math.round(
    Math.min(
      1,
      Math.max(0, value),
    ) * 100,
  );
}

function statusLabel(
  status: CraftDNAVerificationCheck["status"],
) {
  switch (status) {
    case "match":
      return "Confirmed";

    case "conflict":
      return "Conflict";

    case "new":
      return "New evidence";

    case "insufficient_evidence":
      return "Not verified";

    default:
      return "Not verified";
  }
}

function statusClasses(
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
          "border-stone-200 bg-stone-50 text-stone-500",
        icon:
          "bg-stone-100 text-stone-500",
      };
  }
}

function isMissing(
  value: string,
) {
  return (
    !value.trim() ||
    value.trim().toLowerCase() ===
      "not provided"
  );
}

/* -------------------------------------------------------------------------- */
/* Check Card                                                                 */
/* -------------------------------------------------------------------------- */

function VerificationCheckCard({
  check,
  selected,
  onToggle,
}: {
  check: CraftDNAVerificationCheck;
  selected: boolean;
  onToggle: () => void;
}) {
  const styles =
    statusClasses(check.status);

  const canApply =
    check.status === "conflict" ||
    check.status === "new";

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        check.status === "conflict"
          ? "border-amber-200 bg-amber-50/30"
          : check.status === "new"
            ? "border-sky-200 bg-sky-50/20"
            : "border-stone-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles.icon}`}
          >
            {check.status === "match" ? (
              <Check className="h-5 w-5" />
            ) : check.status ===
              "conflict" ? (
              <AlertTriangle className="h-5 w-5" />
            ) : check.status ===
              "new" ? (
              <Sparkles className="h-5 w-5" />
            ) : (
              <CircleHelp className="h-5 w-5" />
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-stone-950">
              {check.label}
            </p>

            <span
              className={`mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold ${styles.badge}`}
            >
              {statusLabel(
                check.status,
              )}
            </span>
          </div>
        </div>

        {canApply && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-stone-600">
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggle}
              className="h-4 w-4 rounded border-stone-300"
            />
            Apply
          </label>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Current Craft DNA
          </p>

          <p
            className={`mt-2 text-sm leading-6 ${
              isMissing(
                check.currentValue,
              )
                ? "italic text-stone-400"
                : "font-medium text-stone-800"
            }`}
          >
            {check.currentValue}
          </p>
        </div>

        <div className="rounded-xl bg-white p-4 ring-1 ring-stone-200">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
            Artisan Voice
          </p>

          <p
            className={`mt-2 text-sm leading-6 ${
              check.voiceClaim ===
              "Not mentioned"
                ? "italic text-stone-400"
                : "font-medium text-stone-800"
            }`}
          >
            {check.voiceClaim}
          </p>
        </div>
      </div>

      {canApply &&
        check.recommendedValue !==
          "Not provided" && (
          <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
              Recommended update
            </p>

            <p className="mt-2 text-sm font-semibold text-stone-900">
              {check.recommendedValue}
            </p>
          </div>
        )}

      <div className="mt-4 flex items-start justify-between gap-4">
        <p className="text-xs leading-5 text-stone-500">
          {check.evidence}
        </p>

        <span className="shrink-0 text-xs font-semibold text-stone-500">
          {confidencePercent(
            check.confidence,
          )}
          %
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

function CraftDNAVerification() {
  const [craftDNA, setCraftDNA] =
    useState<CraftDNA | null>(null);

  const [image, setImage] =
    useState<string | null>(null);

  const [language, setLanguage] =
    useState("");

  const [recording, setRecording] =
    useState(false);

  const [seconds, setSeconds] =
    useState(0);

  const [audioBlob, setAudioBlob] =
    useState<Blob | null>(null);

  const [audioUrl, setAudioUrl] =
    useState<string | null>(null);

  const [fileName, setFileName] =
    useState("");

  const [transcript, setTranscript] =
    useState("");

  const [languageHint, setLanguageHint] =
    useState("auto");

  const [status, setStatus] =
    useState<
      | "idle"
      | "transcribing"
      | "verifying"
      | "done"
    >("idle");

  const [verification, setVerification] =
    useState<CraftDNAVerificationResult | null>(
      null,
    );

  const [selectedFields, setSelectedFields] =
    useState<
      Set<CraftDNAVerificationField>
    >(new Set());

  const [updatesApplied, setUpdatesApplied] =
    useState(false);

  const recorderRef =
    useRef<MediaRecorder | null>(
      null,
    );

  const chunksRef =
    useRef<BlobPart[]>([]);

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  /* ---------------------------------------------------------------------- */
  /* Load DNA                                                                */
  /* ---------------------------------------------------------------------- */

  const loadDNA = () => {
    const draft = getCraftDraft();

    setCraftDNA(
      draft?.craftDNA ??
        getStoredCraftDNA(),
    );

    setImage(
      draft?.image?.enhancedImage ??
        draft?.image?.originalImage ??
        null,
    );
  };

  useEffect(() => {
    loadDNA();

    const refresh = () => {
      loadDNA();
    };

    window.addEventListener(
      "navshakthi:craft-dna-updated",
      refresh,
    );

    window.addEventListener(
      "navshakthi:craft-draft-updated",
      refresh,
    );

    return () => {
      window.removeEventListener(
        "navshakthi:craft-dna-updated",
        refresh,
      );

      window.removeEventListener(
        "navshakthi:craft-draft-updated",
        refresh,
      );
    };
  }, []);

  /* ---------------------------------------------------------------------- */
  /* Cleanup                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );
      }

      recorderRef.current?.stream
        .getTracks()
        .forEach((track) =>
          track.stop(),
        );

      if (audioUrl) {
        URL.revokeObjectURL(
          audioUrl,
        );
      }
    };
  }, [audioUrl]);

  /* ---------------------------------------------------------------------- */
  /* Recording                                                               */
  /* ---------------------------------------------------------------------- */

  const startRecording = async () => {
    if (
      !navigator.mediaDevices
        ?.getUserMedia ||
      typeof MediaRecorder ===
        "undefined"
    ) {
      toast.error(
        "Voice recording is not supported in this browser.",
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
        PREFERRED_MIME_TYPES.find(
          (type) =>
            MediaRecorder.isTypeSupported(
              type,
            ),
        ) ?? "";

      const recorder = mimeType
        ? new MediaRecorder(stream, {
            mimeType,
          })
        : new MediaRecorder(stream);

      chunksRef.current = [];

      recorder.ondataavailable = (
        event,
      ) => {
        if (event.data.size > 0) {
          chunksRef.current.push(
            event.data,
          );
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(
          chunksRef.current,
          {
            type:
              recorder.mimeType ||
              "audio/webm",
          },
        );

        stream
          .getTracks()
          .forEach((track) =>
            track.stop(),
          );

        if (audioUrl) {
          URL.revokeObjectURL(
            audioUrl,
          );
        }

        setAudioBlob(blob);

        setAudioUrl(
          URL.createObjectURL(blob),
        );

        setFileName(
          `craft-verification.${
            blob.type.includes("mp4")
              ? "m4a"
              : "webm"
          }`,
        );

        toast.success(
          "Voice evidence captured.",
        );
      };

      recorderRef.current =
        recorder;

      recorder.start(250);

      setRecording(true);
      setSeconds(0);
      setTranscript("");
      setVerification(null);
      setSelectedFields(
        new Set(),
      );
      setUpdatesApplied(false);

      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );
      }

      timerRef.current =
        setInterval(() => {
          setSeconds(
            (value) => value + 1,
          );
        }, 1000);
    } catch {
      toast.error(
        "Microphone access was blocked. Please allow microphone access and try again.",
      );
    }
  };

  const stopRecording = () => {
    if (!recorderRef.current) {
      return;
    }

    recorderRef.current.stop();

    recorderRef.current = null;

    if (timerRef.current) {
      clearInterval(
        timerRef.current,
      );

      timerRef.current = null;
    }

    setRecording(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Upload                                                                  */
  /* ---------------------------------------------------------------------- */

  const handleAudioUpload = (
    file: File,
  ) => {
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

    setAudioBlob(file);
    setAudioUrl(
      URL.createObjectURL(file),
    );
    setFileName(file.name);
    setTranscript("");
    setVerification(null);
    setSelectedFields(
      new Set(),
    );
    setUpdatesApplied(false);
    setSeconds(0);
  };

  /* ---------------------------------------------------------------------- */
  /* Run verification                                                        */
  /* ---------------------------------------------------------------------- */

  const runVerification =
    async () => {
      if (!audioBlob) {
        toast.error(
          "Record or upload a voice note first.",
        );
        return;
      }

      if (!craftDNA) {
        toast.error(
          "Craft DNA is required before verification.",
        );
        return;
      }

      try {
        setStatus(
          "transcribing",
        );

        const formData =
          new FormData();

        formData.append(
          "audio",
          audioBlob,
          fileName ||
            "craft-verification.webm",
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
              "Voice transcription failed.",
          );
        }

        const nextTranscript =
          String(
            transcriptionData.transcript ||
              "",
          ).trim();

        if (!nextTranscript) {
          throw new Error(
            "No speech was detected.",
          );
        }

        setTranscript(
          nextTranscript,
        );

        setLanguageHint(
          String(
            transcriptionData.languageHint ||
              language ||
              "auto",
          ),
        );

        setStatus("verifying");

        const verificationResponse =
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
                  transcriptionData.languageHint ||
                  language ||
                  "auto",

                craftDNA: {
                  craftCategory:
                    craftDNA
                      .craftCategory
                      .value,

                  productType:
                    craftDNA
                      .productType
                      .value,

                  material:
                    craftDNA
                      .material
                      .value,

                  primaryColour:
                    craftDNA
                      .primaryColour
                      .value,

                  secondaryColours:
                    craftDNA
                      .secondaryColours
                      .value,

                  shape:
                    craftDNA
                      .shape
                      .value,

                  pattern:
                    craftDNA
                      .pattern
                      .value,

                  texture:
                    craftDNA
                      .texture
                      .value,

                  finish:
                    craftDNA
                      .finish
                      .value,

                  decoration:
                    craftDNA
                      .decoration
                      .value,

                  complexity:
                    craftDNA
                      .complexity
                      .value,

                  size:
                    craftDNA
                      .size
                      .value,

                  dimensions:
                    craftDNA
                      .dimensions
                      .value,

                  useCase:
                    craftDNA
                      .useCase
                      .value,
                },
              }),
            },
          );

        const verificationData =
          await verificationResponse.json();

        if (
          !verificationResponse.ok ||
          !verificationData.success
        ) {
          throw new Error(
            verificationData.error ||
              "Craft DNA verification failed.",
          );
        }

        const result =
          verificationData.result as CraftDNAVerificationResult;

        const savedResult: CraftDNAVerificationResult =
          {
            ...result,
            transcript:
              nextTranscript,
            language:
              transcriptionData.languageHint ||
              language ||
              "auto",
            verifiedAt:
              new Date().toISOString(),
          };

        saveCraftDNAVerification(
          savedResult,
        );

        setVerification(
          savedResult,
        );

        setSelectedFields(
          new Set(
            savedResult.checks
              .filter(
                (check) =>
                  check.status ===
                    "conflict" ||
                  check.status === "new",
              )
              .filter(
                (check) =>
                  check.recommendedValue !==
                  "Not provided",
              )
              .map(
                (check) =>
                  check.field,
              ),
          ),
        );

        setUpdatesApplied(false);
        setStatus("done");

        toast.success(
          "Craft DNA voice verification completed.",
        );
      } catch (error) {
        console.error(
          "Craft DNA verification error:",
          error,
        );

        setStatus("idle");

        toast.error(
          error instanceof Error
            ? error.message
            : "Verification failed.",
        );
      }
    };

  /* ---------------------------------------------------------------------- */
  /* Toggle field                                                            */
  /* ---------------------------------------------------------------------- */

  const toggleField = (
    field: CraftDNAVerificationField,
  ) => {
    setSelectedFields(
      (current) => {
        const next = new Set(
          current,
        );

        if (next.has(field)) {
          next.delete(field);
        } else {
          next.add(field);
        }

        return next;
      },
    );

    setUpdatesApplied(false);
  };

  /* ---------------------------------------------------------------------- */
  /* Apply voice evidence                                                    */
  /* ---------------------------------------------------------------------- */

  const applyUpdates = () => {
    if (
      !craftDNA ||
      !verification
    ) {
      return;
    }

    const updated: CraftDNA =
      {
        ...craftDNA,
      };

    let appliedCount = 0;

    for (const check of verification.checks) {
      if (
        !selectedFields.has(
          check.field,
        )
      ) {
        continue;
      }

      if (
        check.status !==
          "conflict" &&
        check.status !== "new"
      ) {
        continue;
      }

      if (
        check.recommendedValue ===
          "Not provided" ||
        !check.recommendedValue.trim()
      ) {
        continue;
      }

      const confidence =
        Math.min(
          1,
          Math.max(
            0,
            check.confidence,
          ),
        );

      switch (check.field) {
        case "craftCategory":
          updated.craftCategory =
            {
              ...updated.craftCategory,
              value:
                check.recommendedValue,
              source:
                "artisan_voice",
              confidence,
            };
          appliedCount++;
          break;

        case "productType":
          updated.productType = {
            ...updated.productType,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "material":
          updated.material = {
            ...updated.material,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "primaryColour":
          updated.primaryColour =
            {
              ...updated.primaryColour,
              value:
                check.recommendedValue,
              source:
                "artisan_voice",
              confidence,
            };
          appliedCount++;
          break;

        case "secondaryColours":
          updated.secondaryColours =
            {
              ...updated.secondaryColours,
              value:
                check.recommendedValue
                  .split(
                    /[,;/|]+/,
                  )
                  .map(
                    (value) =>
                      value.trim(),
                  )
                  .filter(Boolean),
              source:
                "artisan_voice",
              confidence,
            };
          appliedCount++;
          break;

        case "shape":
          updated.shape = {
            ...updated.shape,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "pattern":
          updated.pattern = {
            ...updated.pattern,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "texture":
          updated.texture = {
            ...updated.texture,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "finish":
          updated.finish = {
            ...updated.finish,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "decoration":
          updated.decoration = {
            ...updated.decoration,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "complexity": {
          const numericValue =
            Number(
              check.recommendedValue,
            );

          if (
            Number.isFinite(
              numericValue,
            )
          ) {
            updated.complexity =
              {
                ...updated.complexity,
                value: Math.min(
                  10,
                  Math.max(
                    1,
                    numericValue,
                  ),
                ),
                source:
                  "artisan_voice",
                confidence,
              };

            appliedCount++;
          }

          break;
        }

        case "size":
          updated.size = {
            ...updated.size,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "dimensions":
          updated.dimensions = {
            ...updated.dimensions,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        case "useCase":
          updated.useCase = {
            ...updated.useCase,
            value:
              check.recommendedValue,
            source:
              "artisan_voice",
            confidence,
          };
          appliedCount++;
          break;

        default:
          break;
      }
    }

    if (appliedCount === 0) {
      toast.info(
        "No valid voice-confirmed changes were selected.",
      );
      return;
    }

    updated.overallConfidence =
      Math.min(
        1,
        Math.max(
          0,
          verification.overallConfidence,
        ),
      );

    updated.updatedAt =
      new Date().toISOString();

    const storedDNA =
      saveStoredCraftDNA(
        updated,
      );

    saveDraftCraftDNA(
      storedDNA,
    );

    setCraftDNA(
      storedDNA,
    );

    setSelectedFields(
      new Set(),
    );

    setUpdatesApplied(true);

    toast.success(
      `${appliedCount} voice-confirmed ${
        appliedCount === 1
          ? "update"
          : "updates"
      } applied to Craft DNA.`,
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Reset                                                                   */
  /* ---------------------------------------------------------------------- */

  const resetVerification = () => {
    if (recording) {
      stopRecording();
    }

    setAudioBlob(null);
    setTranscript("");
    setVerification(null);
    setSelectedFields(
      new Set(),
    );
    setStatus("idle");
    setSeconds(0);
    setUpdatesApplied(false);
    setLanguageHint("auto");

    if (audioUrl) {
      URL.revokeObjectURL(
        audioUrl,
      );

      setAudioUrl(null);
    }

    setFileName("");
  };

  /* ---------------------------------------------------------------------- */
  /* Empty DNA                                                               */
  /* ---------------------------------------------------------------------- */

  if (!craftDNA) {
    return (
      <PublicPage>
        <PageHero
          eyebrow="Craft DNA · Verification"
          title="Voice Re-verification"
          subtitle="Use the artisan's own voice as a second evidence layer for the existing Craft DNA."
        />

        <section className="mx-auto max-w-4xl px-6 pb-20">
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm">
            <Database className="mx-auto h-12 w-12 text-stone-300" />

            <h2 className="mt-5 text-2xl font-semibold text-stone-950">
              Craft DNA is required
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-500">
              Create the initial Craft DNA
              profile before running voice
              re-verification.
            </p>

            <Link
              to="/craft-dna"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white"
            >
              Open Craft DNA Studio
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </PublicPage>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Result counts                                                           */
  /* ---------------------------------------------------------------------- */

  const matchCount =
    verification?.checks.filter(
      (check) =>
        check.status === "match",
    ).length ?? 0;

  const conflictCount =
    verification?.checks.filter(
      (check) =>
        check.status === "conflict",
    ).length ?? 0;

  const newEvidenceCount =
    verification?.checks.filter(
      (check) =>
        check.status === "new",
    ).length ?? 0;

  const insufficientCount =
    verification?.checks.filter(
      (check) =>
        check.status ===
        "insufficient_evidence",
    ).length ?? 0;

  const reviewCount =
    conflictCount +
    newEvidenceCount;

  const selectedApplicableCount =
    verification?.checks.filter(
      (check) =>
        selectedFields.has(
          check.field,
        ) &&
        (check.status ===
          "conflict" ||
          check.status === "new") &&
        check.recommendedValue !==
          "Not provided" &&
        Boolean(
          check.recommendedValue.trim(),
        ),
    ).length ?? 0;

  const hasApplicableUpdates =
    selectedApplicableCount > 0;

  return (
    <PublicPage>
      <PageHero
        eyebrow="Craft DNA · Verification"
        title="Voice Re-verification"
        subtitle="Let the artisan confirm what the image-based Craft DNA got right, identify conflicts, and provide new facts."
      />

      <main className="mx-auto max-w-7xl px-6 pb-20">
        {/* BACK */}
        <Link
          to="/craft-dna"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-600 hover:text-stone-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Craft DNA Studio
        </Link>

        {/* REFERENCE */}
        <section className="mb-8">
          <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <div className="grid lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative min-h-[260px] bg-stone-100">
                {image ? (
                  <img
                    src={image}
                    alt="Craft visual reference"
                    className="h-full min-h-[260px] w-full object-cover"
                  />
                ) : (
                  <div className="flex min-h-[260px] items-center justify-center">
                    <Database className="h-10 w-10 text-stone-300" />
                  </div>
                )}
              </div>

              <div className="p-7 lg:p-9">
                <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">
                  <Sparkles className="h-3.5 w-3.5" />
                  Existing Craft DNA
                </div>

                <h2 className="mt-4 text-2xl font-semibold text-stone-950">
                  {
                    craftDNA
                      .productType
                      .value
                  }
                </h2>

                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Voice verification does
                  not replace the existing
                  profile. It checks the
                  artisan's statements against
                  it.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-stone-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Material
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {
                        craftDNA
                          .material
                          .value
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Colour
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {
                        craftDNA
                          .primaryColour
                          .value
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-stone-50 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">
                      Confidence
                    </p>

                    <p className="mt-2 text-sm font-semibold text-stone-900">
                      {confidencePercent(
                        craftDNA.overallConfidence,
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VOICE INPUT */}
        <section className="mb-10">
          <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  01 · Artisan Evidence
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-stone-950">
                  Tell us about this craft
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                  Speak naturally. Mention
                  material, colours, technique,
                  dimensions, finish or anything
                  that should be corrected in the
                  current Craft DNA.
                </p>
              </div>

              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50">
                <Upload className="h-4 w-4" />
                Upload Audio

                <input
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  disabled={
                    recording ||
                    status ===
                      "transcribing" ||
                    status ===
                      "verifying"
                  }
                  onChange={(
                    event,
                  ) => {
                    const file =
                      event.target.files?.[0];

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
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_auto]">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                  Voice Language
                </label>

                <select
                  value={language}
                  onChange={(event) =>
                    setLanguage(
                      event.target.value,
                    )
                  }
                  disabled={
                    recording ||
                    status ===
                      "transcribing" ||
                    status ===
                      "verifying"
                  }
                  className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-stone-500"
                >
                  {LANGUAGES.map(
                    (item) => (
                      <option
                        key={
                          item.label
                        }
                        value={
                          item.value
                        }
                      >
                        {item.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              <div className="flex items-end">
                {!recording ? (
                  <button
                    type="button"
                    onClick={
                      startRecording
                    }
                    disabled={
                      status ===
                        "transcribing" ||
                      status ===
                        "verifying"
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 py-3 text-sm font-semibold text-white hover:bg-stone-800 lg:w-auto"
                  >
                    <Mic className="h-4 w-4" />
                    Record Voice
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={
                      stopRecording
                    }
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-semibold text-white hover:bg-rose-700 lg:w-auto"
                  >
                    <X className="h-4 w-4" />
                    Stop Recording
                  </button>
                )}
              </div>
            </div>

            {(audioUrl ||
              audioBlob) && (
              <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                    <FileAudio className="h-5 w-5 text-stone-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-900">
                      {fileName ||
                        "Voice evidence"}
                    </p>

                    <p className="text-xs text-stone-500">
                      {recording
                        ? `Recording ${seconds}s`
                        : "Voice evidence ready for verification"}
                    </p>
                  </div>

                  {audioUrl && (
                    <audio
                      controls
                      src={audioUrl}
                      className="max-w-full"
                    />
                  )}

                  <button
                    type="button"
                    onClick={
                      resetVerification
                    }
                    className="rounded-xl border border-stone-300 bg-white p-2.5 text-stone-500 hover:bg-stone-50"
                    title="Reset"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {audioBlob && (
              <button
                type="button"
                onClick={
                  runVerification
                }
                disabled={
                  status ===
                    "transcribing" ||
                  status ===
                    "verifying"
                }
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3.5 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status ===
                  "transcribing" ||
                status ===
                  "verifying" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />

                    {status ===
                    "transcribing"
                      ? "Transcribing artisan voice..."
                      : "Comparing voice with Craft DNA..."}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Verify Against Craft DNA
                  </>
                )}
              </button>
            )}
          </div>
        </section>

        {/* TRANSCRIPT */}
        {transcript && (
          <section className="mb-10">
            <div className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    02 · Transcript
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-stone-950">
                    Artisan voice evidence
                  </h2>
                </div>

                <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">
                  {languageHint}
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-stone-50 p-5">
                <p className="text-sm leading-7 text-stone-700">
                  {transcript}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {verification && (
          <section>
            <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                  03 · Evidence Comparison
                </p>

                <h2 className="mt-1 text-2xl font-semibold text-stone-950">
                  Voice ↔ Craft DNA
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                  Review every signal before applying
                  any change to the shared Craft DNA.
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
                      : "border-stone-200 bg-stone-50"
                }`}
              >
                <p className="text-xs font-semibold text-stone-500">
                  Verification confidence
                </p>

                <p className="mt-1 text-2xl font-semibold text-stone-950">
                  {confidencePercent(
                    verification.overallConfidence,
                  )}
                  %
                </p>
              </div>
            </div>

            {/* ---------------------------------------------------------------- */
            /* RESULT SUMMARY                                                   */
            /* ---------------------------------------------------------------- */}

            <div className="mb-6 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-950 text-white">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-stone-950">
                    Verification summary
                  </p>

                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {verification.summary}
                  </p>
                </div>
              </div>

              {/* SUMMARY COUNTERS */}
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-emerald-700">
                      Confirmed
                    </p>

                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>

                  <p className="mt-2 text-2xl font-bold text-emerald-800">
                    {matchCount}
                  </p>

                  <p className="mt-1 text-xs text-emerald-700/80">
                    Voice supports current DNA
                  </p>
                </div>

                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-stone-600">
                      Not mentioned
                    </p>

                    <CircleHelp className="h-4 w-4 text-stone-400" />
                  </div>

                  <p className="mt-2 text-2xl font-bold text-stone-700">
                    {insufficientCount}
                  </p>

                  <p className="mt-1 text-xs text-stone-500">
                    No explicit voice evidence
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-700">
                      Conflicts
                    </p>

                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>

                  <p className="mt-2 text-2xl font-bold text-amber-800">
                    {conflictCount}
                  </p>

                  <p className="mt-1 text-xs text-amber-700/80">
                    Needs artisan review
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-sky-700">
                      New evidence
                    </p>

                    <Sparkles className="h-4 w-4 text-sky-600" />
                  </div>

                  <p className="mt-2 text-2xl font-bold text-sky-800">
                    {newEvidenceCount}
                  </p>

                  <p className="mt-1 text-xs text-sky-700/80">
                    New facts from artisan
                  </p>
                </div>
              </div>

              {/* INTERPRETATION */}
              <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4">
                {updatesApplied ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Voice-confirmed updates applied
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        The selected artisan evidence is now
                        stored in the shared Craft DNA and can
                        be reused by downstream NAVSHAKTHI modules.
                      </p>
                    </div>
                  </div>
                ) : reviewCount > 0 ? (
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {reviewCount}{" "}
                        {reviewCount === 1
                          ? "change needs"
                          : "changes need"}{" "}
                        artisan review
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        Conflicts and new evidence are
                        pre-selected. Nothing changes in Craft
                        DNA until the artisan explicitly approves it.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        No Craft DNA changes are required
                      </p>

                      <p className="mt-1 text-xs leading-5 text-stone-500">
                        The spoken evidence either confirms the
                        existing profile or does not provide enough
                        information to safely change it.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FIELD CARDS */}
            <div className="space-y-4">
              {verification.checks.map(
                (check) => (
                  <VerificationCheckCard
                    key={check.field}
                    check={check}
                    selected={selectedFields.has(
                      check.field,
                    )}
                    onToggle={() =>
                      toggleField(
                        check.field,
                      )
                    }
                  />
                ),
              )}
            </div>

            {/* ACTION BAR */}
            <div className="sticky bottom-4 z-20 mt-8 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-lg backdrop-blur">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {selectedApplicableCount > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-stone-900">
                        {selectedApplicableCount}{" "}
                        {selectedApplicableCount ===
                        1
                          ? "change"
                          : "changes"}{" "}
                        selected
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Review the selected conflict/new evidence
                        before updating Craft DNA.
                      </p>
                    </>
                  ) : reviewCount > 0 ? (
                    <>
                      <p className="text-sm font-semibold text-stone-900">
                        {reviewCount}{" "}
                        {reviewCount === 1
                          ? "review item"
                          : "review items"}{" "}
                        available
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Select a conflict or new evidence item to
                        approve an update.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-emerald-700">
                        No updates required
                      </p>

                      <p className="mt-1 text-xs text-stone-500">
                        Existing Craft DNA is supported by the
                        available artisan evidence.
                      </p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={
                    applyUpdates
                  }
                  disabled={
                    !hasApplicableUpdates
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Save className="h-4 w-4" />

                  {selectedApplicableCount >
                  0
                    ? `Apply ${
                        selectedApplicableCount
                      } ${
                        selectedApplicableCount ===
                        1
                          ? "Update"
                          : "Updates"
                      }`
                    : "Apply Voice-Confirmed Updates"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TRANSPARENCY */}
        <section className="mt-10">
          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-stone-500" />

              <div>
                <h3 className="text-sm font-semibold text-stone-800">
                  Verification is evidence comparison
                </h3>

                <p className="mt-1 text-xs leading-5 text-stone-500">
                  NAVSHAKTHI compares the artisan's
                  spoken statements with the existing
                  Craft DNA. A voice match does not
                  constitute legal authentication,
                  certification or proof of origin.
                  Updates are only applied after
                  explicit artisan review.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicPage>
  );
}

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute(
  "/craft-dna-verification",
)({
  head: () => ({
    meta: [
      {
        title:
          "Craft DNA Voice Re-verification — NAVSHAKTHI",
      },
      {
        name: "description",
        content:
          "Compare artisan voice evidence against the existing NAVSHAKTHI Craft DNA profile.",
      },
    ],
  }),

  component:
    CraftDNAVerification,
});