import {
  createFileRoute,
  Link,
} from "@tanstack/react-router";

import {
  useCallback,
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

import {
  Upload,
  Crop,
  Sun,
  Scissors,
  Wand2,
  Download,
  RotateCcw,
  ImageIcon,
  ShieldCheck,
  Check,
  Loader2,
  Dna,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

import {
  autoEnhanceOptions,
  autoPlanNotes,
  enhanceImage,
  loadImage,
  scoreImage,
  STUDIO_TARGET,
} from "@/lib/image-enhance";

import {
  getCraftDraft,
  saveCraftDNA as saveDraftCraftDNA,
  saveCraftImage,
} from "@/lib/craft-draft";

import {
  saveCraftDNA as saveStoredCraftDNA,
} from "@/lib/craft-dna/storage";

import {
  clearCraftDNAVerification,
} from "@/lib/craft-dna/verification";

/* =========================================================
   PIPELINE STEPS
========================================================= */

const STEPS = [
  "Analyzing product and background",
  "AI-segmenting the craft from its surroundings",
  "Preserving product colour, texture and fine details",
  "Correcting exposure and contrast",
  "Smart-framing the product for e-commerce",
  "Generating the final studio-ready image",
  "Re-analyzing the enhanced image for Craft DNA",
  "Refreshing the image-derived Craft DNA",
];

/* =========================================================
   WORKFLOW STAGES
========================================================= */

const STAGES = [
  {
    icon: Upload,
    title:
      "Upload any craft photo — phone camera, indoor or outdoor",
  },
  {
    icon: Scissors,
    title:
      "AI isolates the actual product from background clutter",
  },
  {
    icon: Sun,
    title:
      "Lighting, exposure, contrast and colour are corrected conservatively",
  },
  {
    icon: Crop,
    title:
      "Product is smart-framed into a consistent 1:1 studio composition",
  },
  {
    icon: Dna,
    title:
      "The enhanced image is re-analyzed to refresh the shared Craft DNA",
  },
];

/* =========================================================
   TECHNOLOGY
========================================================= */

const TECH = [
  {
    name: "IMG.LY ISNet",
    desc:
      "Neural foreground segmentation for automatic background removal.",
  },
  {
    name: "ONNX Runtime Web",
    desc:
      "Runs the segmentation model directly in the browser.",
  },
  {
    name: "Adaptive Image Analysis",
    desc:
      "Measures exposure, contrast and sharpness before enhancement.",
  },
  {
    name: "Image-derived Craft DNA",
    desc:
      "The final enhanced image becomes the visual source for the refreshed Craft DNA.",
  },
];

/* =========================================================
   TYPES
========================================================= */

type Scores = {
  sharpness: number;
  exposure: number;
  contrast: number;
};

/* =========================================================
   CRAFT DNA API RESPONSE
========================================================= */

type CraftDNARefreshResponse = {
  success?: boolean;

  craftDNA?: import(
    "@/lib/craft-dna/types"
  ).CraftDNA;

  error?: string;

  model?: string;
};

/* =========================================================
   IMAGE MEASUREMENT
========================================================= */

function measureImageDataUrl(
  dataUrl: string,
): Promise<Scores | null> {
  return new Promise(
    (resolve) => {
      const output =
        new Image();

      output.onload =
        () => {
          try {
            resolve(
              scoreImage(
                output,
              ),
            );
          } catch {
            resolve(
              null,
            );
          }
        };

      output.onerror =
        () => {
          resolve(
            null,
          );
        };

      output.src =
        dataUrl;
    },
  );
}

/* =========================================================
   ENHANCED IMAGE → FRESH CRAFT DNA
========================================================= */

async function refreshCraftDNAFromEnhancedImage(
  enhancedImage: string,
) {
  if (
    !enhancedImage ||
    !enhancedImage.startsWith(
      "data:image/",
    )
  ) {
    throw new Error(
      "Enhanced image is not available for Craft DNA refresh.",
    );
  }

  const response =
    await fetch(
      "/api/craft-dna/analyze",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          imageDataUrl:
            enhancedImage,
        }),
      },
    );

  let data:
    CraftDNARefreshResponse;

  try {
    data =
      (await response.json()) as CraftDNARefreshResponse;
  } catch {
    throw new Error(
      "Craft DNA analysis returned an invalid server response.",
    );
  }

  if (
    !response.ok ||
    !data.success ||
    !data.craftDNA
  ) {
    throw new Error(
      data.error ||
        "Craft DNA could not be refreshed from the enhanced image.",
    );
  }

  /*
   * IMPORTANT:
   *
   * The API already returns a complete CraftDNA object.
   *
   * We intentionally do NOT call buildCraftDNA()
   * here. This avoids the type mismatch that occurred
   * when a separate ImageDNAAnalysis type was passed
   * into the existing Craft DNA builder.
   */
  return data.craftDNA;
}

/* =========================================================
   IMAGE ENHANCEMENT PIPELINE
========================================================= */

function ImageEnhancementPipeline({
  running,
  onDone,
}: {
  running: boolean;
  onDone: () => void;
}) {
  const [step, setStep] =
    useState(0);

  const completedRef =
    useRef(false);

  const onDoneRef =
    useRef(onDone);

  /*
   * Keep the latest callback without making
   * the timer effect depend on callback identity.
   */

  useEffect(() => {
    onDoneRef.current =
      onDone;
  }, [onDone]);

  /*
   * Reset pipeline whenever a new run starts.
   */

  useEffect(() => {
    if (!running) {
      setStep(0);

      completedRef.current =
        false;

      return;
    }

    setStep(0);

    completedRef.current =
      false;
  }, [running]);

  /*
   * Advance pipeline.
   */

  useEffect(() => {
    if (!running) {
      return;
    }

    /*
     * All visual steps are complete.
     *
     * onDone() now performs the actual enhancement
     * and the enhanced-image Craft DNA refresh.
     */

    if (
      step >=
      STEPS.length
    ) {
      if (
        completedRef.current
      ) {
        return;
      }

      completedRef.current =
        true;

      onDoneRef.current();

      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setStep(
            (current) =>
              current + 1,
          );
        },
        620,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [
    running,
    step,
  ]);

  const progress =
    running
      ? Math.min(
          100,
          (step /
            STEPS.length) *
            100,
        )
      : 0;

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">

      <div className="mb-4 flex items-center justify-between gap-4">

        <div>

          <div className="font-display text-lg">
            AI Image Enhancement Pipeline
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Product-aware image processing followed by
            automatic Craft DNA refresh
          </p>

        </div>

        <div className="text-xs font-semibold text-muted-foreground">

          {running
            ? step >=
              STEPS.length
              ? "Finalizing"
              : `Step ${Math.min(
                  step + 1,
                  STEPS.length,
                )}/${STEPS.length}`
            : "Ready"}

        </div>

      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">

        <div
          className="h-full rounded-full bg-gradient-to-r from-primary via-gold to-clay transition-all duration-500"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      <ol className="mt-5 space-y-2">

        {STEPS.map(
          (
            text,
            index,
          ) => {

            const done =
              running &&
              step >
                index;

            const active =
              running &&
              step ===
                index;

            return (
              <li
                key={
                  text
                }
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${
                  active
                    ? "bg-primary/5"
                    : ""
                }`}
              >

                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-gold text-earth"
                        : "bg-muted text-muted-foreground"
                  }`}
                >

                  {done ? (
                    <Check className="h-3 w-3" />
                  ) : active ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    index +
                    1
                  )}

                </span>

                <span
                  className={
                    done
                      ? "text-foreground"
                      : active
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                  }
                >
                  {
                    text
                  }
                </span>

              </li>
            );
          },
        )}

      </ol>

    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

function Page() {
  const [running, setRunning] =
    useState(false);

  const [file, setFile] =
    useState<File | null>(
      null,
    );

  const [original, setOriginal] =
    useState<
      string | null
    >(null);

  const [enhanced, setEnhanced] =
    useState<
      string | null
    >(null);

  const [scores, setScores] =
    useState<
      Scores | null
    >(null);

  const [afterScores, setAfterScores] =
    useState<
      Scores | null
    >(null);

  const [notes, setNotes] =
    useState<
      string[]
    >([]);

  const [bgPercent, setBgPercent] =
    useState(0);

  const [split, setSplit] =
    useState(50);

  const [dragging, setDragging] =
    useState(false);

  const [
    dnaRefreshing,
    setDnaRefreshing,
  ] = useState(false);

  const [
    dnaRefreshComplete,
    setDnaRefreshComplete,
  ] = useState(false);

  const imgRef =
    useRef<
      HTMLImageElement | null
    >(null);

  const inputRef =
    useRef<
      HTMLInputElement | null
    >(null);

  /* =======================================================
     ACCEPT IMAGE
  ======================================================= */

  const accept =
    useCallback(
      async (
        selectedFile:
          | File
          | null
          | undefined,
      ) => {
        if (!selectedFile) {
          return;
        }

        if (
          !selectedFile.type.startsWith(
            "image/",
          )
        ) {
          toast.error(
            "Please choose a JPG, PNG or WebP image",
          );

          return;
        }

        if (
          selectedFile.size >
          10 *
            1024 *
            1024
        ) {
          toast.error(
            "Image is larger than 10 MB",
          );

          return;
        }

        try {
          const img =
            await loadImage(
              selectedFile,
            );

          /*
           * Revoke previous preview URL before
           * replacing it with the new image.
           */

          setOriginal(
            (
              previous,
            ) => {
              if (
                previous
              ) {
                URL.revokeObjectURL(
                  previous,
                );
              }

              return URL.createObjectURL(
                selectedFile,
              );
            },
          );

          imgRef.current =
            img;

          setFile(
            selectedFile,
          );

          setEnhanced(
            null,
          );

          setAfterScores(
            null,
          );

          setNotes(
            [],
          );

          setBgPercent(
            0,
          );

          setSplit(
            50,
          );

          setDnaRefreshing(
            false,
          );

          setDnaRefreshComplete(
            false,
          );

          setScores(
            scoreImage(
              img,
            ),
          );

          toast.success(
            "Photo loaded — starting automatic AI studio pass",
          );

          setRunning(
            true,
          );
        } catch (
          error
        ) {
          console.error(
            "Image loading failed:",
            error,
          );

          toast.error(
            "Could not read that image",
          );
        }
      },
      [],
    );

  /* =======================================================
     RUN AGAIN
  ======================================================= */

  const run = () => {
    if (
      !imgRef.current
    ) {
      inputRef.current?.click();

      toast(
        "Choose a photo from your device first",
      );

      return;
    }

    setEnhanced(
      null,
    );

    setAfterScores(
      null,
    );

    setNotes(
      [],
    );

    setBgPercent(
      0,
    );

    setSplit(
      50,
    );

    setDnaRefreshing(
      false,
    );

    setDnaRefreshComplete(
      false,
    );

    setRunning(
      true,
    );
  };

  /* =======================================================
     ACTUAL AI PROCESSING
  ======================================================= */

  const finish =
    useCallback(
      async () => {
        const img =
          imgRef.current;

        if (!img) {
          setRunning(
            false,
          );

          return;
        }

        try {
          /* =================================================
             1. ANALYZE SOURCE IMAGE
          ================================================= */

          const measured =
            scoreImage(
              img,
            );

          setScores(
            measured,
          );

          /* =================================================
             2. CREATE ADAPTIVE ENHANCEMENT PLAN
          ================================================= */

          const plan =
            autoEnhanceOptions(
              measured,
            );

          /* =================================================
             3. ENHANCE IMAGE
          ================================================= */

          const result =
            await enhanceImage(
              img,
              plan,
            );

          const enhancedImage =
            result.dataUrl;

          setEnhanced(
            enhancedImage,
          );

          setBgPercent(
            result.bgPercent,
          );

          setNotes(
            autoPlanNotes(
              measured,
              plan,
            ),
          );

          setSplit(
            50,
          );

          /* =================================================
             4. SAVE ENHANCED IMAGE
          ================================================= */

          saveCraftImage({
            originalImage:
              null,

            enhancedImage,

            imageScore:
              measured,

            afterImageScore:
              null,

            backgroundRemovedPercent:
              result.bgPercent,
          });

          window.dispatchEvent(
            new Event(
              "navshakthi:craft-draft-updated",
            ),
          );

          /* =================================================
             5. MEASURE ENHANCED IMAGE
          ================================================= */

          const finalScores =
            await measureImageDataUrl(
              enhancedImage,
            );

          if (
            finalScores
          ) {
            setAfterScores(
              finalScores,
            );

            const latestDraft =
              getCraftDraft();

            if (
              latestDraft?.image
            ) {
              saveCraftImage({
                ...latestDraft.image,

                afterImageScore:
                  finalScores,
              });

              window.dispatchEvent(
                new Event(
                  "navshakthi:craft-draft-updated",
                ),
              );
            }
          }

          /* =================================================
             6. START CRAFT DNA REFRESH
          ================================================= */

          setDnaRefreshing(
            true,
          );

          toast.loading(
            "Enhanced image ready — refreshing Craft DNA from the new image…",
            {
              id:
                "craft-dna-refresh",
            },
          );

          /* =================================================
             7. IMAGE → GEMINI IMAGE INTELLIGENCE
          ================================================= */

          const refreshedDNA =
            await refreshCraftDNAFromEnhancedImage(
              enhancedImage,
            );

          /* =================================================
             8. REPLACE OLD CRAFT DNA
          ================================================= */

          /*
           * CRITICAL:
           *
           * DO NOT merge this with old DNA.
           *
           * The enhanced image is now the newest visual
           * source of truth.
           *
           * Therefore the old visual DNA is replaced by
           * a fresh image-derived Craft DNA.
           */

          saveStoredCraftDNA(
            refreshedDNA,
          );

          saveDraftCraftDNA(
            refreshedDNA,
          );

          /* =================================================
             9. INVALIDATE OLD VOICE VERIFICATION
          ================================================= */

          /*
           * The previous voice verification may have been
           * performed against an older visual baseline.
           *
           * New image = new DNA.
           *
           * Therefore old verification must not remain
           * marked as current.
           */

          clearCraftDNAVerification();

          /* =================================================
             10. BROADCAST SHARED UPDATE
          ================================================= */

          window.dispatchEvent(
            new Event(
              "navshakthi:craft-dna-updated",
            ),
          );

          window.dispatchEvent(
            new Event(
              "navshakthi:craft-draft-updated",
            ),
          );

          setDnaRefreshing(
            false,
          );

          setDnaRefreshComplete(
            true,
          );

          toast.success(
            "Craft DNA refreshed from the enhanced image.",
            {
              id:
                "craft-dna-refresh",
            },
          );

          /*
           * Keep the processing indicator alive until
           * BOTH image enhancement and DNA refresh finish.
           */

          setRunning(
            false,
          );

          toast.success(
            "AI image and image-derived Craft DNA are synchronized.",
          );
        } catch (
          error
        ) {
          console.error(
            "AI image enhancement / Craft DNA refresh failed:",
            error,
          );

          setRunning(
            false,
          );

          setDnaRefreshing(
            false,
          );

          toast.dismiss(
            "craft-dna-refresh",
          );

          const message =
            error instanceof Error
              ? error.message
              : "Unknown AI processing error";

          toast.error(
            `Image processing failed: ${message}`,
          );
        }
      },
      [],
    );

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    imgRef.current =
      null;

    setRunning(
      false,
    );

    setFile(
      null,
    );

    setOriginal(
      (
        previous,
      ) => {
        if (
          previous
        ) {
          URL.revokeObjectURL(
            previous,
          );
        }

        return null;
      },
    );

    setEnhanced(
      null,
    );

    setScores(
      null,
    );

    setAfterScores(
      null,
    );

    setNotes(
      [],
    );

    setBgPercent(
      0,
    );

    setSplit(
      50,
    );

    setDragging(
      false,
    );

    setDnaRefreshing(
      false,
    );

    setDnaRefreshComplete(
      false,
    );

    if (
      inputRef.current
    ) {
      inputRef.current.value =
        "";
    }
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <PublicPage>

      {/* ===================================================
          HERO
      =================================================== */}

      <PageHero
        eyebrow="Feature · AI Image Studio"
        title="AI Image Studio"
        subtitle="Fully automatic. Upload any craft photo and AI isolates the product, corrects lighting, preserves its natural colours and details, creates a professionally framed 1:1 catalog image, then refreshes Craft DNA from that enhanced image."
      />

      {/* ===================================================
          MAIN STUDIO
      =================================================== */}

      <section className="container-x py-16">

        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">

          {/* =================================================
              LEFT PANEL
          ================================================= */}

          <Reveal>

            <div className="rounded-3xl border border-border/60 bg-card p-6">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="font-display text-2xl">
                    Drop a photo — that's the whole process
                  </div>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Processed privately in your browser.
                    No editing skills required.
                    The enhanced image automatically
                    refreshes the shared Craft DNA.
                  </p>

                </div>

                {file && (

                  <button
                    type="button"
                    onClick={
                      reset
                    }
                    disabled={
                      running
                    }
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <RotateCcw className="h-3 w-3" />

                    Reset

                  </button>

                )}

              </div>

              {/* =================================================
                  BADGES
              ================================================= */}

              <div className="mt-4 flex flex-wrap gap-2">

                {[
                  `${STUDIO_TARGET.size}×${STUDIO_TARGET.size} · ${STUDIO_TARGET.ratio}`,
                  STUDIO_TARGET.background,
                  "Adaptive exposure correction",
                  "AI background removal",
                  "Craft DNA auto-refresh",
                ].map(
                  (
                    text,
                  ) => (

                    <span
                      key={
                        text
                      }
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary"
                    >

                      <ShieldCheck className="h-3 w-3" />

                      {
                        text
                      }

                    </span>

                  ),
                )}

              </div>

              {/* =================================================
                  UPLOAD
              ================================================= */}

              <label
                onDragOver={(
                  event,
                ) => {
                  event.preventDefault();

                  setDragging(
                    true,
                  );
                }}
                onDragLeave={() =>
                  setDragging(
                    false,
                  )
                }
                onDrop={(
                  event,
                ) => {
                  event.preventDefault();

                  setDragging(
                    false,
                  );

                  void accept(
                    event
                      .dataTransfer
                      .files?.[0],
                  );
                }}
                className={`mt-5 flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed text-center text-xs text-muted-foreground transition ${
                  dragging
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-muted/30 hover:border-primary/50"
                }`}
              >

                {original ? (

                  <img
                    src={
                      original
                    }
                    alt="Uploaded artisan product"
                    className="h-full w-full object-contain"
                  />

                ) : (

                  <>

                    <Upload className="h-6 w-6 text-primary" />

                    <span className="font-semibold text-foreground">
                      Drag &amp; drop a photo
                    </span>

                    <span>
                      or click to browse — JPG /
                      PNG / WebP, max 10 MB
                    </span>

                  </>

                )}

                <input
                  ref={
                    inputRef
                  }
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(
                    event,
                  ) =>
                    void accept(
                      event
                        .target
                        .files?.[0],
                    )
                  }
                />

              </label>

              {/* =================================================
                  FILE INFO
              ================================================= */}

              {file && (

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">

                  <ImageIcon className="h-3.5 w-3.5 text-primary" />

                  <span className="font-semibold text-foreground">
                    {
                      file.name
                    }
                  </span>

                  <span>
                    ·{" "}
                    {(
                      file.size /
                      1024 /
                      1024
                    ).toFixed(
                      2,
                    )}{" "}
                    MB
                  </span>

                  {imgRef.current && (

                    <span>
                      ·{" "}
                      {
                        imgRef
                          .current
                          .naturalWidth
                      }
                      ×
                      {
                        imgRef
                          .current
                          .naturalHeight
                      }{" "}
                      px
                    </span>

                  )}

                </div>

              )}

              {/* =================================================
                  QUALITY SCORES
              ================================================= */}

              {scores && (

                <div className="mt-4 grid grid-cols-3 gap-3">

                  {(
                    [
                      "sharpness",
                      "exposure",
                      "contrast",
                    ] as const
                  ).map(
                    (
                      key,
                    ) => {

                      const value =
                        afterScores
                          ? afterScores[
                              key
                            ]
                          : scores[
                              key
                            ];

                      return (

                        <div
                          key={
                            key
                          }
                          className="rounded-xl border border-border/60 bg-background p-3"
                        >

                          <div className="flex items-center justify-between gap-2">

                            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                              {
                                key
                              }
                            </span>

                            <span className="text-xs font-semibold">
                              {
                                value
                              }
                              %
                            </span>

                          </div>

                          {afterScores && (

                            <div className="mt-2 text-[10px] font-semibold text-primary">

                              was{" "}
                              {
                                scores[
                                  key
                                ]
                              }
                              {" → "}
                              target{" "}
                              {
                                STUDIO_TARGET[
                                  key
                                ]
                              }

                            </div>

                          )}

                          <div className="mt-2 h-1.5 rounded-full bg-muted">

                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{
                                width: `${value}%`,
                              }}
                            />

                          </div>

                        </div>

                      );
                    },
                  )}

                </div>

              )}

              {/* =================================================
                  CRAFT DNA REFRESH STATUS
              ================================================= */}

              {dnaRefreshing && (

                <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">

                  <div className="flex items-start gap-3">

                    <div className="rounded-xl bg-primary/10 p-2.5 text-primary">

                      <RefreshCw className="h-5 w-5 animate-spin" />

                    </div>

                    <div>

                      <div className="font-semibold text-foreground">
                        Refreshing image-derived Craft DNA
                      </div>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        The enhanced image is being
                        re-analyzed. Fresh visual
                        attributes will replace the
                        previous image-derived baseline.
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {dnaRefreshComplete &&
                !dnaRefreshing && (

                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">

                      <Check className="h-5 w-5" />

                    </div>

                    <div>

                      <div className="font-semibold text-emerald-900">
                        Craft DNA refreshed successfully
                      </div>

                      <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                        Craft DNA now represents
                        the latest enhanced image.
                        Downstream NAVSHAKTHI modules
                        receive the refreshed identity.
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* =================================================
                  NOTES
              ================================================= */}

              {notes.length >
                0 && (

                <ul className="mt-4 space-y-1.5 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">

                  <li className="text-[10px] font-semibold uppercase tracking-widest text-clay">
                    Automatic image corrections
                  </li>

                  {notes.map(
                    (
                      note,
                    ) => (

                      <li
                        key={
                          note
                        }
                      >
                        ·{" "}
                        {
                          note
                        }
                      </li>

                    ),
                  )}

                </ul>

              )}

              {/* =================================================
                  RUN
              ================================================= */}

              <button
                type="button"
                onClick={
                  run
                }
                disabled={
                  running
                }
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >

                {running ? (

                  <span className="inline-flex items-center justify-center gap-2">

                    <Loader2 className="h-4 w-4 animate-spin" />

                    {dnaRefreshing
                      ? "Refreshing Craft DNA…"
                      : "Running AI studio pass…"}

                  </span>

                ) : (

                  enhanced
                    ? "Run studio pass again"
                    : file
                      ? "Run studio pass"
                      : "Choose a photo"

                )}

              </button>

              {/* =================================================
                  BEFORE / AFTER
              ================================================= */}

              {enhanced &&
                original && (

                <div className="mt-6">

                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border/60 bg-muted">

                    {/* ENHANCED */}

                    <img
                      src={
                        enhanced
                      }
                      alt="AI-enhanced catalog-ready product photo"
                      className="absolute inset-0 h-full w-full object-contain"
                    />

                    {/* ORIGINAL */}

                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden"
                      style={{
                        width: `${split}%`,
                      }}
                    >

                      <img
                        src={
                          original
                        }
                        alt="Original artisan product photo"
                        className="absolute inset-0 h-full w-full object-contain"
                      />

                      <span className="absolute bottom-2 left-2 rounded-full bg-earth/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-cream">
                        Original
                      </span>

                    </div>

                    {/* SLIDER */}

                    <div
                      className="pointer-events-none absolute inset-y-0 w-0.5 bg-gold"
                      style={{
                        left: `${split}%`,
                      }}
                    />

                    <span className="absolute bottom-2 right-2 rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                      AI-enhanced
                    </span>

                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={
                      split
                    }
                    onChange={(
                      event,
                    ) =>
                      setSplit(
                        Number(
                          event
                            .target
                            .value,
                        ),
                      )
                    }
                    aria-label="Before and after comparison"
                    className="mt-3 w-full accent-[var(--color-primary,#0B5D50)]"
                  />

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">

                    <div className="text-xs text-muted-foreground">

                      {
                        bgPercent
                      }
                      % of source pixels classified as background
                      · exported 1000×1000 JPG

                    </div>

                    <a
                      href={
                        enhanced
                      }
                      download={`navshakthi-${(
                        file?.name ||
                        "product"
                      ).replace(
                        /\.[^.]+$/,
                        "",
                      )}-enhanced.jpg`}
                      onClick={() =>
                        toast.success(
                          "Downloading catalog-ready image",
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full bg-earth px-5 py-2.5 text-xs font-semibold text-cream hover:bg-earth/90"
                    >

                      <Download className="h-4 w-4" />

                      Download image

                    </a>

                  </div>

                </div>

              )}

            </div>

          </Reveal>

          {/* =================================================
              RIGHT PIPELINE
          ================================================= */}

          <Reveal delay={0.1}>

            <ImageEnhancementPipeline
              running={
                running
              }
              onDone={
                finish
              }
            />

          </Reveal>

        </div>

      </section>

      {/* =====================================================
          WORKFLOW
      ===================================================== */}

      <section className="bg-muted/40 py-16">

        <div className="container-x">

          <Reveal>

            <div className="max-w-2xl">

              <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                Workflow
              </div>

              <h2 className="mt-2 font-display text-3xl">
                Image → Enhanced Image → Fresh Craft DNA
              </h2>

              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                NAVSHAKTHI treats the latest enhanced craft
                image as the visual source of truth. Craft DNA
                is rebuilt from that image instead of retaining
                stale attributes from the previous image.
              </p>

            </div>

          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

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
                      {index +
                        1}
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

        </div>

      </section>

      {/* =====================================================
          DATA LINEAGE
      ===================================================== */}

      <section className="container-x py-16">

        <Reveal>

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-7">

            <div className="flex items-start gap-4">

              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <Dna className="h-6 w-6" />
              </div>

              <div className="max-w-3xl">

                <div className="text-xs font-semibold uppercase tracking-widest text-clay">
                  Craft DNA data lineage
                </div>

                <h2 className="mt-2 font-display text-2xl">
                  The enhanced image becomes the new visual baseline
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Every enhancement run now refreshes Craft DNA
                  directly from the final enhanced image. The
                  previous DNA is not blindly merged into the
                  new result.
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-semibold">

                  <span className="rounded-full bg-background px-3 py-2">
                    Original image
                  </span>

                  <ArrowRight className="h-4 w-4 text-primary" />

                  <span className="rounded-full bg-background px-3 py-2">
                    AI enhanced image
                  </span>

                  <ArrowRight className="h-4 w-4 text-primary" />

                  <span className="rounded-full bg-background px-3 py-2">
                    Image Intelligence
                  </span>

                  <ArrowRight className="h-4 w-4 text-primary" />

                  <span className="rounded-full bg-primary px-3 py-2 text-primary-foreground">
                    Fresh Craft DNA
                  </span>

                </div>

              </div>

            </div>

          </div>

        </Reveal>

      </section>

      {/* =====================================================
          AI STACK
      ===================================================== */}

      <section className="container-x py-16">

        <Reveal>

          <div className="max-w-2xl">

            <div className="text-xs font-semibold uppercase tracking-widest text-clay">
              AI stack
            </div>

            <h2 className="mt-2 font-display text-3xl">
              Browser-based intelligent image processing
            </h2>

          </div>

        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {TECH.map(
            (
              technology,
              index,
            ) => (

              <Reveal
                key={
                  technology.name
                }
                delay={
                  index *
                  0.05
                }
              >

                <div className="rounded-2xl border border-border/60 bg-card p-5">

                  <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {
                      technology.name
                    }
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {
                      technology.desc
                    }
                  </div>

                </div>

              </Reveal>

            ),
          )}

        </div>

      </section>

      {/* =====================================================
          CTA
      ===================================================== */}

      <FeatureCta
        heading="Every craft deserves a professional first impression."
        icon={Wand2}
        secondary="See it on live products"
      />

    </PublicPage>
  );
}

/* =========================================================
   CTA
========================================================= */

export function FeatureCta({
  heading,
  icon: Icon = Download,
  secondary,
}: {
  heading: string;
  icon?: typeof Download;
  secondary: string;
}) {
  return (
    <section className="container-x pb-24">

      <Reveal>

        <div className="rounded-[2.5rem] bg-earth p-10 text-cream md:p-14">

          <Icon className="h-8 w-8 text-gold" />

          <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            {
              heading
            }
          </h2>

          <div className="mt-8 flex flex-wrap gap-4">

            <Link
              to="/auth/signup"
              className="rounded-full bg-gold px-6 py-3 text-sm font-semibold text-earth hover:bg-gold/90"
            >
              Try it as an artisan
            </Link>

            <Link
              to="/marketplace"
              className="rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              {
                secondary
              }
            </Link>

          </div>

        </div>

      </Reveal>

    </section>
  );
}

/* =========================================================
   ROUTE
========================================================= */

export const Route =
  createFileRoute(
    "/ai-image-studio",
  )({
    head: () => ({
      meta: [

        {
          title:
            "AI Image Studio — NAVSHAKTHI",
        },

        {
          name:
            "description",
          content:
            "Studio-grade artisan product photos with AI background removal, adaptive lighting correction, natural colour preservation and automatic refresh of image-derived Craft DNA.",
        },

        {
          property:
            "og:title",
          content:
            "AI Image Studio — NAVSHAKTHI",
        },

        {
          property:
            "og:description",
          content:
            "AI-powered product isolation, image enhancement and automatic image-derived Craft DNA refresh.",
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

    component:
      Page,
  });