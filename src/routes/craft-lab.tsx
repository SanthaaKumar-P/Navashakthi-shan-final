import { createFileRoute } from "@tanstack/react-router";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCraftDraft,
  createCraftDraftFromPrototype,
} from "@/lib/craft-draft";

import {
  getCraftDNA,
} from "@/lib/craft-dna/storage";

import type {
  CraftDNA,
} from "@/lib/craft-dna/types";

import {
  deleteCraftLabExperiment,
  getCraftLabExperiments,
  saveCraftLabExperiment,
} from "@/lib/craft-lab/storage";

import {
  generateCraftLabIdeas,
  generateCraftLabPrototype,
} from "@/lib/craft-lab/engine";

import type {
  CraftExperiment,
  CraftLabMarketContext,
  CraftLabMode,
} from "@/lib/craft-lab/types";

export const Route = createFileRoute(
  "/craft-lab",
)({
  component: CraftLabPage,
});

/* =========================================================
   PAGE
========================================================= */

function CraftLabPage() {
  const [craftDNA, setCraftDNA] =
    useState<CraftDNA | null>(null);

  const [experiments, setExperiments] =
    useState<CraftExperiment[]>([]);

  const [mode, setMode] =
    useState<CraftLabMode>("variant");

  const [artisanPrompt, setArtisanPrompt] =
    useState("");

  const [marketContext, setMarketContext] =
    useState<CraftLabMarketContext | undefined>(
      undefined,
    );

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [prototypeLoadingId, setPrototypeLoadingId] =
    useState<string | null>(null);

  const [usingDesignId, setUsingDesignId] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  /* =======================================================
     LOAD DATA
  ======================================================= */

  useEffect(() => {
    function loadCraftLabData() {
      /*
       * The shared Craft Draft represents the active
       * artisan workflow.
       *
       * Prefer Craft Draft DNA first and fall back to
       * dedicated Craft DNA storage.
       */
      const draft =
        getCraftDraft();

      const sharedDNA =
        draft?.craftDNA ??
        getCraftDNA();

      setCraftDNA(
        sharedDNA,
      );

      setExperiments(
        getCraftLabExperiments(),
      );
    }

    /*
     * Initial load.
     */
    loadCraftLabData();

    /*
     * Craft DNA updates from Smart Cataloger /
     * Image Intelligence.
     */
    function handleCraftDNAUpdate() {
      loadCraftLabData();
    }

    /*
     * Shared craft draft updates.
     */
    function handleCraftDraftUpdate() {
      loadCraftLabData();
    }

    window.addEventListener(
      "navashakthi:craft-dna-updated",
      handleCraftDNAUpdate,
    );

    window.addEventListener(
      "navashakthi:craft-draft-updated",
      handleCraftDraftUpdate,
    );

    return () => {
      window.removeEventListener(
        "navashakthi:craft-dna-updated",
        handleCraftDNAUpdate,
      );

      window.removeEventListener(
        "navashakthi:craft-draft-updated",
        handleCraftDraftUpdate,
      );
    };
  }, []);

  /* =======================================================
     SORT EXPERIMENTS
  ======================================================= */

  const sortedExperiments =
    useMemo(
      () =>
        [...experiments].sort(
          (a, b) =>
            new Date(
              b.createdAt,
            ).getTime() -
            new Date(
              a.createdAt,
            ).getTime(),
        ),
      [experiments],
    );

  /* =======================================================
     GENERATE EXPERIMENTS
  ======================================================= */

  async function handleGenerate() {
    if (!craftDNA) {
      setError(
        "Craft DNA is required. Complete Image Intelligence first.",
      );

      return;
    }

    setIsGenerating(
      true,
    );

    setError(null);

    try {
      /*
       * Gemini Free Tier is used here only for
       * structured experiment generation.
       */
      const result =
        await generateCraftLabIdeas({
          mode,
          craftDNA,
          artisanPrompt,
        });

      setMarketContext(
        result.marketContext,
      );

      /*
       * Save all generated experiments.
       */
      result.experiments.forEach(
        (experiment) => {
          saveCraftLabExperiment(
            experiment,
          );
        },
      );

      setExperiments(
        getCraftLabExperiments(),
      );
    } catch (
      generationError
    ) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : "Unable to generate Craft Lab experiments.",
      );
    } finally {
      setIsGenerating(
        false,
      );
    }
  }

  /* =======================================================
     CREATE LOCAL VISUAL PROTOTYPE
  ======================================================= */

  async function handleGeneratePrototype(
    experiment: CraftExperiment,
  ) {
    if (!craftDNA) {
      setError(
        "Craft DNA is required before creating a prototype.",
      );

      return;
    }

    setPrototypeLoadingId(
      experiment.id,
    );

    setError(null);

    try {
      const draft =
        getCraftDraft();

      /*
       * Prefer enhanced image.
       *
       * If enhanced image is unavailable,
       * use the original craft image.
       */
      const baseImage =
        draft?.image?.enhancedImage ??
        draft?.image?.originalImage ??
        undefined;

      /*
       * IMPORTANT:
       *
       * This now calls the LOCAL prototype engine.
       *
       * No Gemini image-generation model is used.
       */
      const result =
        await generateCraftLabPrototype(
          experiment,
          craftDNA,
          baseImage,
        );

      const updated:
        CraftExperiment = {
        ...experiment,

        status:
          "selected",

        prototypeImage:
          result.imageDataUrl,

        prototypeGeneratedAt:
          result.generatedAt,

        updatedAt:
          new Date().toISOString(),
      };

      saveCraftLabExperiment(
        updated,
      );

      setExperiments(
        getCraftLabExperiments(),
      );
    } catch (
      prototypeError
    ) {
      setError(
        prototypeError instanceof Error
          ? prototypeError.message
          : "Unable to create visual prototype.",
      );
    } finally {
      setPrototypeLoadingId(
        null,
      );
    }
  }

  /* =======================================================
     USE THIS DESIGN
  ======================================================= */

  async function handleUseThisDesign(
    experiment: CraftExperiment,
  ) {
    if (!experiment.prototypeImage) {
      setError(
        "Create a visual prototype before using this design.",
      );

      return;
    }

    if (!craftDNA) {
      setError(
        "Craft DNA is required to create the new craft draft.",
      );

      return;
    }

    setUsingDesignId(
      experiment.id,
    );

    setError(null);

    try {
      /*
       * Create a completely fresh craft draft.
       *
       * Prototype image becomes the new craft image.
       *
       * Existing Craft DNA is preserved.
       *
       * Catalog, pricing and final selling price
       * are intentionally reset.
       */
      createCraftDraftFromPrototype({
        prototypeImage:
          experiment.prototypeImage,

        craftDNA,
      });

      /*
       * Mark the experiment as selected.
       */
      const updated:
        CraftExperiment = {
        ...experiment,

        status:
          "selected",

        updatedAt:
          new Date().toISOString(),
      };

      saveCraftLabExperiment(
        updated,
      );

      setExperiments(
        getCraftLabExperiments(),
      );

      /*
       * Continue into Smart Cataloger.
       *
       * Smart Cataloger now works with the
       * newly created prototype image.
       */
      window.location.assign(
        "/smart-cataloger",
      );
    } catch (
      useDesignError
    ) {
      setError(
        useDesignError instanceof Error
          ? useDesignError.message
          : "Unable to create the new craft draft.",
      );
    } finally {
      setUsingDesignId(
        null,
      );
    }
  }

  /* =======================================================
     SELECT EXPERIMENT
  ======================================================= */

  function handleSelect(
    experiment: CraftExperiment,
  ) {
    const updated:
      CraftExperiment = {
      ...experiment,

      status:
        "selected",

      updatedAt:
        new Date().toISOString(),
    };

    saveCraftLabExperiment(
      updated,
    );

    setExperiments(
      getCraftLabExperiments(),
    );
  }

  /* =======================================================
     DELETE EXPERIMENT
  ======================================================= */

  function handleDelete(
    id: string,
  ) {
    deleteCraftLabExperiment(
      id,
    );

    setExperiments(
      getCraftLabExperiments(),
    );
  }

  /* =======================================================
     DISPLAY HELPERS
  ======================================================= */

  function formatDemand(
    direction:
      | CraftLabMarketContext["demandDirection"]
      | undefined,
  ) {
    if (!direction) {
      return "Not available";
    }

    switch (direction) {
      case "increasing":
        return "Increasing";

      case "decreasing":
        return "Decreasing";

      case "stable":
        return "Stable";

      default:
        return "Insufficient data";
    }
  }

  function formatLevel(
    level: string | undefined,
  ) {
    if (!level) {
      return "Not available";
    }

    return level
      .replaceAll(
        "_",
        " ",
      )
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main className="min-h-screen bg-[#f7f4ee] px-6 py-10">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <section className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            NAVSHAKTHI
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Craft Lab
          </h1>

          <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
            Experiment with your existing craft identity
            to discover new variants, design directions,
            and future product opportunities.
          </p>
        </section>

        {/* =================================================
            CURRENT CRAFT DNA
        ================================================= */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Current Craft DNA
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Craft Lab uses your existing visual identity
                as the foundation for experimentation.
              </p>
            </div>

            <div
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                craftDNA
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {craftDNA
                ? "Craft DNA Ready"
                : "Craft DNA Required"}
            </div>
          </div>

          {craftDNA && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <DNAItem
                label="Craft"
                value={
                  craftDNA
                    .craftCategory
                    .value
                }
              />

              <DNAItem
                label="Product"
                value={
                  craftDNA
                    .productType
                    .value
                }
              />

              <DNAItem
                label="Material"
                value={
                  craftDNA
                    .material
                    .value
                }
              />

              <DNAItem
                label="Primary Colour"
                value={
                  craftDNA
                    .primaryColour
                    .value
                }
              />

            </div>
          )}
        </section>

        {/* =================================================
            EXPERIMENT GENERATOR
        ================================================= */}

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-slate-900">
              Design an Experiment
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Gemini generates structured ideas while
              preserving the important attributes of your
              Craft DNA.
            </p>
          </div>

          {/* MODES */}

          <div className="grid gap-4 md:grid-cols-3">

            <ModeCard
              active={
                mode === "variant"
              }
              title="Variant Explorer"
              description="Keep the core craft identity and explore controlled variations."
              onClick={() =>
                setMode(
                  "variant",
                )
              }
            />

            <ModeCard
              active={
                mode === "design"
              }
              title="Design Experiment"
              description="Explore visual or functional design changes while retaining craft identity."
              onClick={() =>
                setMode(
                  "design",
                )
              }
            />

            <ModeCard
              active={
                mode === "new_product"
              }
              title="New Product"
              description="Explore a new product direction based on the same craft DNA."
              onClick={() =>
                setMode(
                  "new_product",
                )
              }
            />

          </div>

          {/* ARTISAN PROMPT */}

          <div className="mt-6">
            <label
              htmlFor="artisan-prompt"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Optional artisan direction
            </label>

            <textarea
              id="artisan-prompt"
              value={
                artisanPrompt
              }
              onChange={(
                event,
              ) =>
                setArtisanPrompt(
                  event.target.value,
                )
              }
              placeholder="Example: Try a more contemporary version suitable for younger customers..."
              className="min-h-28 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </div>

          {/* GENERATE */}

          <div className="mt-6 flex flex-wrap items-center gap-4">

            <button
              type="button"
              onClick={
                handleGenerate
              }
              disabled={
                isGenerating ||
                !craftDNA
              }
              className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating
                ? "Generating Experiments..."
                : "Generate Craft Experiments"}
            </button>

            {!craftDNA && (
              <p className="text-sm text-red-600">
                Complete Craft DNA before using Craft Lab.
              </p>
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

        </section>

        {/* =================================================
            FUTURE PLANNER
        ================================================= */}

        {marketContext && (
          <section className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-6">

            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                Future Planner Context
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                Craft Lab uses this market context to make
                experiments more decision-oriented.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

              <PlannerMetric
                label="Demand"
                value={formatDemand(
                  marketContext
                    .demandDirection,
                )}
              />

              <PlannerMetric
                label="Opportunity"
                value={`${formatLevel(
                  marketContext
                    .opportunityLevel,
                )} · ${Math.round(
                  marketContext
                    .opportunityScore,
                )}/100`}
              />

              <PlannerMetric
                label="Seasonality"
                value={formatLevel(
                  marketContext
                    .seasonalityLevel,
                )}
              />

              <PlannerMetric
                label="3-Month Outlook"
                value={
                  marketContext
                    .threeMonth
                    ? `${
                        marketContext
                          .threeMonth
                          .changePercent >=
                        0
                          ? "+"
                          : ""
                      }${marketContext.threeMonth.changePercent.toFixed(
                        1,
                      )}%`
                    : "Not available"
                }
              />

              <PlannerMetric
                label="Production"
                value={formatLevel(
                  marketContext
                    .productionRecommendation,
                )}
              />

            </div>

            {/* GOVERNMENT EVENTS */}

            {marketContext
              .governmentEvents
              .length > 0 && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-white p-4">

                <h3 className="text-sm font-semibold text-slate-900">
                  Relevant Government / Market Events
                </h3>

                <ul className="mt-3 space-y-2">
                  {marketContext
                    .governmentEvents
                    .slice(0, 5)
                    .map(
                      (
                        event,
                        index,
                      ) => (
                        <li
                          key={`${event.title}-${index}`}
                          className="text-sm text-slate-600"
                        >
                          <span className="font-medium text-slate-800">
                            {
                              event.title
                            }
                          </span>

                          {event.location && (
                            <span>
                              {" "}
                              ·{" "}
                              {
                                event.location
                              }
                            </span>
                          )}
                        </li>
                      ),
                    )}
                </ul>

              </div>
            )}

            {/* DATA NOTES */}

            {marketContext
              .dataQuality
              ?.notes
              ?.length ? (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Data note:{" "}
                {marketContext.dataQuality.notes.join(
                  " ",
                )}
              </p>
            ) : null}

          </section>
        )}

        {/* =================================================
            EXPERIMENTS
        ================================================= */}

        <section>

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                Your Experiments
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Turn a selected concept into a new craft
                product workflow.
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
              {
                sortedExperiments.length
              }{" "}
              {sortedExperiments.length ===
              1
                ? "experiment"
                : "experiments"}
            </span>

          </div>

          {/* EMPTY STATE */}

          {sortedExperiments.length ===
          0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">

              <h3 className="text-lg font-semibold text-slate-900">
                No experiments yet
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                Generate structured ideas based on your
                Craft DNA and Future Planner context.
              </p>

            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">

              {sortedExperiments.map(
                (
                  experiment,
                ) => (
                  <ExperimentCard
                    key={
                      experiment.id
                    }
                    experiment={
                      experiment
                    }
                    onSelect={() =>
                      handleSelect(
                        experiment,
                      )
                    }
                    onDelete={() =>
                      handleDelete(
                        experiment.id,
                      )
                    }
                    onGeneratePrototype={() =>
                      handleGeneratePrototype(
                        experiment,
                      )
                    }
                    onUseThisDesign={() =>
                      handleUseThisDesign(
                        experiment,
                      )
                    }
                    prototypeLoading={
                      prototypeLoadingId ===
                      experiment.id
                    }
                    usingDesign={
                      usingDesignId ===
                      experiment.id
                    }
                  />
                ),
              )}

            </div>
          )}

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   DNA ITEM
========================================================= */

function DNAItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   MODE CARD
========================================================= */

function ModeCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`rounded-2xl border p-5 text-left transition ${
        active
          ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100"
          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <span
          className={`mt-1 h-3 w-3 rounded-full ${
            active
              ? "bg-amber-500"
              : "bg-slate-200"
          }`}
        />

      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </button>
  );
}

/* =========================================================
   PLANNER METRIC
========================================================= */

function PlannerMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4">

      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   EXPERIMENT CARD
========================================================= */

function ExperimentCard({
  experiment,
  onSelect,
  onDelete,
  onGeneratePrototype,
  onUseThisDesign,
  prototypeLoading,
  usingDesign,
}: {
  experiment: CraftExperiment;
  onSelect: () => void;
  onDelete: () => void;
  onGeneratePrototype: () => void;
  onUseThisDesign: () => void;
  prototypeLoading: boolean;
  usingDesign: boolean;
}) {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* =================================================
          TITLE
      ================================================= */}

      <div className="flex items-start justify-between gap-3">

        <div>

          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {experiment.mode.replace(
              "_",
              " ",
            )}
          </span>

          <h3 className="mt-3 text-lg font-semibold text-slate-900">
            {experiment.title}
          </h3>

        </div>

        {experiment.status ===
          "selected" && (
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Selected
          </span>
        )}

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mt-5 flex-1">

        {/* CONCEPT */}

        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Concept
        </h4>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {experiment.concept}
        </p>

        {/* RATIONALE */}

        <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Why this experiment?
        </h4>

        <p className="mt-2 text-sm leading-6 text-slate-700">
          {experiment.rationale}
        </p>

        {/* RETAINED */}

        {experiment
          .retainedAttributes
          .length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Retained
            </h4>

            <div className="mt-2 flex flex-wrap gap-2">
              {experiment.retainedAttributes.map(
                (
                  attribute,
                ) => (
                  <span
                    key={
                      attribute
                    }
                    className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700"
                  >
                    {
                      attribute
                    }
                  </span>
                ),
              )}
            </div>
          </>
        )}

        {/* CHANGED */}

        {experiment
          .changedAttributes
          .length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Changed
            </h4>

            <div className="mt-2 flex flex-wrap gap-2">
              {experiment.changedAttributes.map(
                (
                  attribute,
                ) => (
                  <span
                    key={
                      attribute
                    }
                    className="rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700"
                  >
                    {
                      attribute
                    }
                  </span>
                ),
              )}
            </div>
          </>
        )}

        {/* PRODUCTION */}

        {experiment
          .productionNotes
          .length > 0 && (
          <>
            <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Production Notes
            </h4>

            <ul className="mt-2 space-y-2">
              {experiment.productionNotes.map(
                (
                  note,
                ) => (
                  <li
                    key={
                      note
                    }
                    className="text-sm leading-5 text-slate-600"
                  >
                    •{" "}
                    {note}
                  </li>
                ),
              )}
            </ul>
          </>
        )}

        {/* =================================================
            LOCAL VISUAL PROTOTYPE
        ================================================= */}

        {experiment.prototypeImage && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">

            <img
              src={
                experiment.prototypeImage
              }
              alt={`Craft Lab visual prototype for ${experiment.title}`}
              className="aspect-square w-full object-cover"
            />

            <div className="border-t border-slate-200 bg-white px-4 py-3">

              <p className="text-xs font-medium text-slate-500">
                Craft Lab Visual Prototype
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Local concept visualization based on
                the existing craft image, Craft DNA,
                and selected experiment. It is a design
                prototype, not a claim that the product
                already exists.
              </p>

            </div>
          </div>
        )}

      </div>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5">

        {/* LOCAL PROTOTYPE */}

        <button
          type="button"
          onClick={
            onGeneratePrototype
          }
          disabled={
            prototypeLoading ||
            usingDesign
          }
          className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {prototypeLoading
            ? "Creating Visual Prototype..."
            : experiment.prototypeImage
              ? "Regenerate Prototype"
              : "Create Visual Prototype"}
        </button>

        {/* USE DESIGN */}

        {experiment.prototypeImage && (
          <button
            type="button"
            onClick={
              onUseThisDesign
            }
            disabled={
              usingDesign ||
              prototypeLoading
            }
            className="w-full rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {usingDesign
              ? "Creating New Craft..."
              : "Use This Design"}
          </button>
        )}

        {/* SELECT + DELETE */}

        <div className="flex gap-3">

          <button
            type="button"
            onClick={
              onSelect
            }
            disabled={
              experiment.status ===
                "selected" ||
              usingDesign
            }
            className="flex-1 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {experiment.status ===
            "selected"
              ? "Selected"
              : "Select Experiment"}
          </button>

          <button
            type="button"
            onClick={
              onDelete
            }
            disabled={
              usingDesign
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Delete
          </button>

        </div>

      </div>

    </article>
  );
}