import {
  createFileRoute,
  Link,
} from "@tanstack/react-router"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"

import { toast } from "sonner"

import {
  PublicPage,
  PageHero,
} from "@/components/public-page"

import { Reveal } from "@/components/section"

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
} from "lucide-react"

import {
  autoEnhanceOptions,
  autoPlanNotes,
  enhanceImage,
  loadImage,
  scoreImage,
  STUDIO_TARGET,
} from "@/lib/image-enhance"

import {
  getCraftDraft,
  saveCraftImage,
} from "@/lib/craft-draft"

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
]

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
]

/* =========================================================
   TECHNOLOGY
========================================================= */

const TECH = [
  {
    name: "IMG.LY ISNet",
    desc:
      "Neural foreground segmentation for automatic background removal",
  },
  {
    name: "ONNX Runtime Web",
    desc:
      "Runs the segmentation model directly in the browser",
  },
  {
    name: "Adaptive Image Analysis",
    desc:
      "Measures exposure, contrast and sharpness before enhancement",
  },
  {
    name: "Smart Studio Composition",
    desc:
      "Consistent framing, neutral presentation background and natural shadow",
  },
]

type Scores = {
  sharpness: number
  exposure: number
  contrast: number
}

/* =========================================================
   LOCAL IMAGE PIPELINE
   IMPORTANT:
   This replaces the old ScanPipeline dependency.
========================================================= */

function ImageEnhancementPipeline({
  running,
  onDone,
}: {
  running: boolean
  onDone: () => void
}) {
  const [step, setStep] =
    useState(0)

  const completedRef =
    useRef(false)

  const onDoneRef =
    useRef(onDone)

  /*
   * Keep latest callback without making
   * the timer effect depend on callback identity.
   */

  useEffect(() => {
    onDoneRef.current =
      onDone
  }, [onDone])

  /*
   * Reset once when running changes.
   */

  useEffect(() => {
    if (!running) {
      setStep(0)
      completedRef.current =
        false
      return
    }

    setStep(0)
    completedRef.current =
      false
  }, [running])

  /*
   * Advance pipeline.
   */

  useEffect(() => {
    if (!running) {
      return
    }

    /*
     * All visual pipeline steps completed.
     */

    if (
      step >= STEPS.length
    ) {
      if (
        completedRef.current
      ) {
        return
      }

      completedRef.current =
        true

      onDoneRef.current()

      return
    }

    const timer =
      window.setTimeout(() => {
        setStep(
          (current) =>
            current + 1,
        )
      }, 620)

    return () => {
      window.clearTimeout(
        timer,
      )
    }
  }, [running, step])

  const progress =
    running
      ? Math.min(
          100,
          (step /
            STEPS.length) *
            100,
        )
      : 0

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <div className="font-display text-lg">
            AI Image Enhancement Pipeline
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            Product-aware browser image processing
          </p>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          {running
            ? step >= STEPS.length
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
          (text, index) => {
            const done =
              running &&
              step > index

            const active =
              running &&
              step === index

            return (
              <li
                key={text}
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
                    index + 1
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
                  {text}
                </span>
              </li>
            )
          },
        )}
      </ol>
    </div>
  )
}

/* =========================================================
   PAGE
========================================================= */

function Page() {
  const [running, setRunning] =
    useState(false)

  const [file, setFile] =
    useState<File | null>(null)

  const [original, setOriginal] =
    useState<string | null>(null)

  const [enhanced, setEnhanced] =
    useState<string | null>(null)

  const [scores, setScores] =
    useState<Scores | null>(null)

  const [afterScores, setAfterScores] =
    useState<Scores | null>(null)

  const [notes, setNotes] =
    useState<string[]>([])

  const [bgPercent, setBgPercent] =
    useState(0)

  const [split, setSplit] =
    useState(50)

  const [dragging, setDragging] =
    useState(false)

  const imgRef =
    useRef<HTMLImageElement | null>(
      null,
    )

  const inputRef =
    useRef<HTMLInputElement | null>(
      null,
    )

  /* =======================================================
     ACCEPT IMAGE
  ======================================================= */

  const accept = useCallback(
    async (
      selectedFile:
        | File
        | null
        | undefined,
    ) => {
      if (!selectedFile) {
        return
      }

      if (
        !selectedFile.type.startsWith(
          "image/",
        )
      ) {
        toast.error(
          "Please choose a JPG, PNG or WebP image",
        )

        return
      }

      if (
        selectedFile.size >
        10 * 1024 * 1024
      ) {
        toast.error(
          "Image is larger than 10 MB",
        )

        return
      }

      try {
        const img =
          await loadImage(
            selectedFile,
          )

        imgRef.current =
          img

        setFile(
          selectedFile,
        )

        setOriginal(
          URL.createObjectURL(
            selectedFile,
          ),
        )

        setEnhanced(null)

        setAfterScores(null)

        setNotes([])

        setBgPercent(0)

        setSplit(50)

        setScores(
          scoreImage(img),
        )

        toast.success(
          "Photo loaded — starting automatic AI studio pass",
        )

        setRunning(true)
      } catch (error) {
        console.error(
          "Image loading failed:",
          error,
        )

        toast.error(
          "Could not read that image",
        )
      }
    },
    [],
  )

  /* =======================================================
     RUN AGAIN
  ======================================================= */

  const run = () => {
    if (!imgRef.current) {
      inputRef.current?.click()

      toast(
        "Choose a photo from your device first",
      )

      return
    }

    setEnhanced(null)

    setAfterScores(null)

    setNotes([])

    setBgPercent(0)

    setSplit(50)

    setRunning(true)
  }

  /* =======================================================
     ACTUAL AI PROCESSING
  ======================================================= */

  const finish =
    useCallback(
      async () => {
        const img =
          imgRef.current

        if (!img) {
          setRunning(false)
          return
        }

        try {
          /*
           * Analyze source.
           */

          const measured =
            scoreImage(img)

          setScores(
            measured,
          )

          /*
           * Create adaptive enhancement plan.
           */

          const plan =
            autoEnhanceOptions(
              measured,
            )

          /*
           * ACTUAL AI WORK.
           *
           * This waits for IMG.LY to finish
           * segmentation.
           */

          const result =
            await enhanceImage(
              img,
              plan,
            )

          /*
           * Update result.
           */

          setEnhanced(
            result.dataUrl,
          )

          setBgPercent(
            result.bgPercent,
          )

          saveCraftImage({
            originalImage: null,
            enhancedImage: result.dataUrl,
            imageScore: measured,
            afterImageScore: null,
            backgroundRemovedPercent:
              result.bgPercent,
          })

          window.dispatchEvent(
            new Event(
              "navshakthi:craft-draft-updated",
            ),
          )

          setNotes(
            autoPlanNotes(
              measured,
              plan,
            ),
          )

          setSplit(50)

          /*
           * Measure final image.
           */

          const output =
            new Image()

          output.onload =
            () => {
              const finalScores =
                scoreImage(output)

              setAfterScores(
                finalScores,
              )

              const latestDraft =
                getCraftDraft()

              if (latestDraft?.image) {
                saveCraftImage({
                  ...latestDraft.image,
                  afterImageScore:
                    finalScores,
                })

                window.dispatchEvent(
                  new Event(
                    "navshakthi:craft-draft-updated",
                  ),
                )
              }
            }

          output.src =
            result.dataUrl

          setRunning(false)

          toast.success(
            "AI-enhanced catalog image generated",
          )
        } catch (error) {
          console.error(
            "AI image enhancement failed:",
            error,
          )

          setRunning(false)

          const message =
            error instanceof Error
              ? error.message
              : "Unknown AI processing error"

          toast.error(
            `AI enhancement failed: ${message}`,
          )
        }
      },
      [],
    )

  /* =======================================================
     RESET
  ======================================================= */

  const reset = () => {
    imgRef.current =
      null

    setRunning(false)

    setFile(null)

    setOriginal(
      (previous) => {
        if (previous) {
          URL.revokeObjectURL(
            previous,
          )
        }

        return null
      },
    )

    setEnhanced(null)

    setScores(null)

    setAfterScores(null)

    setNotes([])

    setBgPercent(0)

    setSplit(50)

    setDragging(false)

    if (inputRef.current) {
      inputRef.current.value =
        ""
    }
  }

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
        subtitle="Fully automatic. Upload any craft photo and AI isolates the product, corrects lighting, preserves its natural colours and details, then creates a professionally framed 1:1 catalog image."
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
                  </p>
                </div>

                {file && (
                  <button
                    onClick={reset}
                    className="inline-flex items-center gap-1 rounded-full border border-border/60 px-3 py-1.5 text-xs font-semibold hover:bg-muted"
                  >
                    <RotateCcw className="h-3 w-3" />

                    Reset
                  </button>
                )}
              </div>

              {/* BADGES */}

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  `${STUDIO_TARGET.size}×${STUDIO_TARGET.size} · ${STUDIO_TARGET.ratio}`,
                  STUDIO_TARGET.background,
                  "Adaptive exposure correction",
                  "AI background removal",
                ].map(
                  (text) => (
                    <span
                      key={text}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-primary"
                    >
                      <ShieldCheck className="h-3 w-3" />

                      {text}
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
                  event.preventDefault()

                  setDragging(
                    true,
                  )
                }}
                onDragLeave={() =>
                  setDragging(
                    false,
                  )
                }
                onDrop={(
                  event,
                ) => {
                  event.preventDefault()

                  setDragging(
                    false,
                  )

                  void accept(
                    event
                      .dataTransfer
                      .files?.[0],
                  )
                }}
                className={`mt-5 flex aspect-[16/9] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed text-center text-xs text-muted-foreground transition ${
                  dragging
                    ? "border-primary bg-primary/10"
                    : "border-border/60 bg-muted/30 hover:border-primary/50"
                }`}
              >
                {original ? (
                  <img
                    src={original}
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
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(
                    event,
                  ) =>
                    void accept(
                      event.target
                        .files?.[0],
                    )
                  }
                />
              </label>

              {/* FILE INFO */}

              {file && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <ImageIcon className="h-3.5 w-3.5 text-primary" />

                  <span className="font-semibold text-foreground">
                    {file.name}
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
                    (key) => {
                      const value =
                        afterScores
                          ? afterScores[
                              key
                            ]
                          : scores[
                              key
                            ]

                      return (
                        <div
                          key={
                            key
                          }
                          className="rounded-xl border border-border/60 bg-muted/30 p-3"
                        >
                          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                            {
                              key
                            }
                          </div>

                          <div className="mt-1 font-display text-xl">
                            {
                              value
                            }

                            <span className="text-xs text-muted-foreground">
                              /100
                            </span>
                          </div>

                          {afterScores && (
                            <div className="text-[10px] font-semibold text-primary">
                              was{" "}
                              {
                                scores[
                                  key
                                ]
                              }{" "}
                              → target{" "}
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
                      )
                    },
                  )}
                </div>
              )}

              {/* =================================================
                  NOTES
              ================================================= */}

              {notes.length >
                0 && (
                <ul className="mt-4 space-y-1.5 rounded-2xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
                  <li className="text-[10px] font-semibold uppercase tracking-widest text-clay">
                    Automatic corrections applied
                  </li>

                  {notes.map(
                    (note) => (
                      <li
                        key={
                          note
                        }
                      >
                        ·{" "}
                        {note}
                      </li>
                    ),
                  )}
                </ul>
              )}

              {/* =================================================
                  RUN
              ================================================= */}

              <button
                onClick={run}
                disabled={running}
                className="mt-5 w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {running
                  ? "Running AI studio pass…"
                  : enhanced
                    ? "Run studio pass again"
                    : file
                      ? "Run studio pass"
                      : "Choose a photo"}
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
                A 4-stage AI enhancement journey
              </h2>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

                  <div className="mt-3 text-sm text-muted-foreground">
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
  )
}

/* =========================================================
   CTA
========================================================= */

export function FeatureCta({
  heading,
  icon: Icon = Download,
  secondary,
}: {
  heading: string
  icon?: typeof Download
  secondary: string
}) {
  return (
    <section className="container-x pb-24">
      <Reveal>
        <div className="rounded-[2.5rem] bg-earth p-10 text-cream md:p-14">
          <Icon className="h-8 w-8 text-gold" />

          <h2 className="mt-5 max-w-2xl font-display text-3xl leading-tight sm:text-4xl">
            {heading}
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
              {secondary}
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
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
            "Studio-grade artisan product photos with AI background removal, adaptive lighting correction, natural colour preservation and marketplace-ready cropping.",
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
            "AI-powered product isolation, image enhancement and e-commerce formatting for artisan products.",
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
  })