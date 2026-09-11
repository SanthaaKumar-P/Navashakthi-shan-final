import { getCraftDraft } from "@/lib/craft-draft";

import type {
  CraftDNA,
} from "@/lib/craft-dna/types";

import type {
  CraftExperiment,
  CraftLabGenerationInput,
  CraftLabGenerationResult,
  CraftLabMarketContext,
  CraftLabPrototypeResult,
} from "@/lib/craft-lab/types";

/* =========================================================
   FUTURE PLANNER API RESPONSE
========================================================= */

type FuturePlannerApiResponse = {
  success?: boolean;

  result?: {
    demandDirection:
      | "increasing"
      | "stable"
      | "decreasing"
      | "insufficient_data";

    demandChange: number | null;

    opportunityScore: number;

    opportunityLevel:
      | "low"
      | "medium"
      | "high"
      | "insufficient_data";

    seasonalityLevel:
      | "low"
      | "medium"
      | "high"
      | "none"
      | "insufficient_data";

    productionRecommendation: string;

    threeMonth?: {
      low: number;
      central: number;
      high: number;
      changePercent: number;
    };

    sixMonth?: {
      low: number;
      central: number;
      high: number;
      changePercent: number;
    };

    governmentEvents?: Array<{
      title: string;
      startDate?: string;
      endDate?: string;
      location?: string;
      relevance?: number;
      source?: string;
    }>;

    sources?: Array<{
      label: string;
      url: string;
      type: string;
      updatedAt?: string;
    }>;

    dataQuality?: {
      marketReferenceAvailable: boolean;
      governmentEventsAvailable: boolean;
      tradeDataAvailable: boolean;
      odopDataAvailable: boolean;
      notes: string[];
    };
  };

  error?: string;
};

/* =========================================================
   SAVED FUTURE PLANNER TYPE
========================================================= */

type SavedFuturePlanner = NonNullable<
  NonNullable<
    NonNullable<
      ReturnType<typeof getCraftDraft>
    >["pricing"]
  >["futurePlanner"]
>;

/* =========================================================
   MAPPERS
========================================================= */

function mapOpportunityLevel(
  level: SavedFuturePlanner["opportunityLevel"],
): CraftLabMarketContext["opportunityLevel"] {
  switch (level) {
    case "low":
      return "low";

    case "medium":
      return "moderate";

    case "high":
      return "high";

    case "insufficient_data":
      return "insufficient_data";
  }
}

function mapSeasonalityLevel(
  level: SavedFuturePlanner["seasonalOpportunity"]["level"],
): CraftLabMarketContext["seasonalityLevel"] {
  switch (level) {
    case "low":
      return "low";

    case "medium":
      return "moderate";

    case "high":
      return "high";

    case "none":
      return "none";
  }
}

function mapDemandDirection(
  trend: SavedFuturePlanner["demandTrend"],
): CraftLabMarketContext["demandDirection"] {
  switch (trend) {
    case "rising":
      return "increasing";

    case "stable":
      return "stable";

    case "falling":
      return "decreasing";

    case "insufficient_data":
      return "insufficient_data";
  }
}

/* =========================================================
   SAVED FUTURE PLANNER → CRAFT LAB
========================================================= */

function mapSavedPlannerContext(
  planner: SavedFuturePlanner,
): CraftLabMarketContext {
  return {
    demandDirection:
      mapDemandDirection(
        planner.demandTrend,
      ),

    demandChange:
      planner.demandMomentum,

    opportunityScore:
      planner.opportunityScore ?? 0,

    opportunityLevel:
      mapOpportunityLevel(
        planner.opportunityLevel,
      ),

    seasonalityLevel:
      mapSeasonalityLevel(
        planner.seasonalOpportunity.level,
      ),

    productionRecommendation:
      planner.recommendation,

    /*
     * Saved Future Planner stores the outlook under
     * outlook3Month / outlook6Month.
     *
     * Do not fabricate changePercent when the saved
     * structure does not contain it.
     */
    threeMonth:
      undefined,

    sixMonth:
      undefined,

    governmentEvents:
      planner.governmentOpportunity.events.map(
        (event) => ({
          title:
            event.title,

          startDate:
            event.startDate,

          endDate:
            event.endDate,

          source:
            event.sourceUrl,
        }),
      ),

    dataQuality: {
      marketReferenceAvailable:
        planner.dataQuality !==
        "limited",

      governmentEventsAvailable:
        planner.governmentOpportunity.events
          .length > 0,

      /*
       * Saved Future Planner does not expose these
       * independently, so don't invent availability.
       */
      tradeDataAvailable:
        false,

      odopDataAvailable:
        false,

      notes: [
        `Future Planner evidence quality: ${planner.dataQuality}.`,
        ...planner.reasons,
      ],
    },

    sources:
      planner.sources.map(
        (source) => ({
          label:
            source.name,

          url:
            source.url,

          type:
            source.type,

          updatedAt:
            source.observedAt,
        }),
      ),
  };
}

/* =========================================================
   API FUTURE PLANNER → CRAFT LAB
========================================================= */

function mapApiPlannerContext(
  result: NonNullable<
    FuturePlannerApiResponse["result"]
  >,
): CraftLabMarketContext {
  return {
    demandDirection:
      result.demandDirection,

    demandChange:
      result.demandChange,

    opportunityScore:
      result.opportunityScore,

    opportunityLevel:
      result.opportunityLevel ===
      "medium"
        ? "moderate"
        : result.opportunityLevel,

    seasonalityLevel:
      result.seasonalityLevel ===
      "medium"
        ? "moderate"
        : result.seasonalityLevel,

    productionRecommendation:
      result.productionRecommendation,

    threeMonth:
      result.threeMonth,

    sixMonth:
      result.sixMonth,

    governmentEvents:
      (
        result.governmentEvents ??
        []
      ).map(
        (event) => ({
          title:
            event.title,

          startDate:
            event.startDate ??
            "",

          endDate:
            event.endDate ??
            "",

          location:
            event.location,

          relevance:
            event.relevance,

          source:
            event.source,
        }),
      ),

    dataQuality:
      result.dataQuality,

    sources:
      result.sources,
  };
}

/* =========================================================
   PRICING VALIDATION
========================================================= */

function hasValidPricingRange(
  low: number | undefined,
  high: number | undefined,
): low is number {
  return (
    typeof low === "number" &&
    Number.isFinite(low) &&
    typeof high === "number" &&
    Number.isFinite(high) &&
    high >= low
  );
}

/* =========================================================
   CRAFT LAB API RESPONSE
========================================================= */

type CraftLabExperimentResponse = {
  title: string;
  concept: string;
  rationale: string;
  retainedAttributes: string[];
  changedAttributes: string[];
  productionNotes: string[];
};

type CraftLabGenerateResponse = {
  success?: boolean;

  /*
   * CURRENT API RESPONSE
   *
   * {
   *   success: true,
   *   experiments: [...]
   * }
   */
  experiments?: CraftLabExperimentResponse[];

  /*
   * BACKWARD-COMPATIBLE RESPONSE
   *
   * {
   *   success: true,
   *   result: {
   *     experiments: [...]
   *   }
   * }
   */
  result?: {
    experiments?: CraftLabExperimentResponse[];
    generatedAt?: string;
  };

  generatedAt?: string;

  error?: string;
};

/* =========================================================
   GET FUTURE PLANNER CONTEXT
========================================================= */

async function getFuturePlannerContext(
  craftDNA: CraftDNA,
): Promise<
  CraftLabMarketContext | undefined
> {
  const draft =
    getCraftDraft();

  /*
   * -------------------------------------------------------
   * FIRST: reuse existing Future Planner
   * -------------------------------------------------------
   */

  const savedPlanner =
    draft?.pricing?.futurePlanner;

  if (savedPlanner) {
    return mapSavedPlannerContext(
      savedPlanner,
    );
  }

  /*
   * -------------------------------------------------------
   * SECOND: generate Future Planner if pricing exists
   * -------------------------------------------------------
   */

  const low =
    draft?.pricing?.low;

  const high =
    draft?.pricing?.high;

  if (
    !hasValidPricingRange(
      low,
      high,
    )
  ) {
    return undefined;
  }

  try {
    const response =
      await fetch(
        "/api/pricing/future-planner",
        {
          method:
            "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            category:
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

            currentLow:
              low,

            currentHigh:
              high,

            complexity:
              craftDNA
                .complexity
                .value,
          }),
        },
      );

    if (!response.ok) {
      return undefined;
    }

    const data =
      (await response.json()) as FuturePlannerApiResponse;

    if (
      !data.success ||
      !data.result
    ) {
      return undefined;
    }

    return mapApiPlannerContext(
      data.result,
    );
  } catch {
    /*
     * Craft Lab can still generate ideas even if
     * Future Planner is temporarily unavailable.
     */
    return undefined;
  }
}

/* =========================================================
   GEMINI TEXT EXPERIMENT GENERATION
========================================================= */

export async function generateCraftLabIdeas(
  input: CraftLabGenerationInput,
): Promise<CraftLabGenerationResult> {
  if (!input.craftDNA) {
    throw new Error(
      "Craft DNA is required before generating Craft Lab experiments.",
    );
  }

  const marketContext =
    input.marketContext ??
    (await getFuturePlannerContext(
      input.craftDNA,
    ));

  const response =
    await fetch(
      "/api/craft-lab/generate",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          mode:
            input.mode,

          craftDNA:
            input.craftDNA,

          marketContext,

          artisanPrompt:
            input.artisanPrompt
              ?.trim() ||
            undefined,
        }),
      },
    );

  /* -------------------------------------------------------
     HANDLE HTTP ERRORS
  ------------------------------------------------------- */

  if (!response.ok) {
    let message =
      "Craft Lab generation failed.";

    try {
      const errorData =
        (await response.json()) as {
          error?: string;
        };

      if (
        typeof errorData.error ===
          "string" &&
        errorData.error.trim()
      ) {
        message =
          errorData.error.trim();
      }
    } catch {
      /*
       * Response was not JSON.
       * Keep the clean fallback message.
       */
    }

    throw new Error(
      message,
    );
  }

  /* -------------------------------------------------------
     READ RESPONSE
  ------------------------------------------------------- */

  const data =
    (await response.json()) as CraftLabGenerateResponse;

  /*
   * The corrected API returns experiments
   * directly at the top level.
   *
   * We also support the old nested result shape
   * for compatibility.
   */
  const experiments =
    data.experiments ??
    data.result?.experiments;

  if (
    !data.success ||
    !experiments
  ) {
    throw new Error(
      data.error ||
        "Craft Lab did not return experiments.",
    );
  }

  /* -------------------------------------------------------
     VALIDATE EXPERIMENT COUNT
  ------------------------------------------------------- */

  if (
    experiments.length !== 3
  ) {
    throw new Error(
      `Craft Lab returned ${experiments.length} experiments. Exactly 3 are required.`,
    );
  }

  /* -------------------------------------------------------
     CREATE CRAFT LAB EXPERIMENT OBJECTS
  ------------------------------------------------------- */

  const now =
    new Date().toISOString();

  const generatedExperiments: CraftExperiment[] =
    experiments.map(
      (experiment) => ({
        id:
          crypto.randomUUID(),

        title:
          experiment.title,

        mode:
          input.mode,

        concept:
          experiment.concept,

        rationale:
          experiment.rationale,

        retainedAttributes:
          experiment.retainedAttributes,

        changedAttributes:
          experiment.changedAttributes,

        productionNotes:
          experiment.productionNotes,

        marketContext,

        baseCraftDNA:
          input.craftDNA,

        status:
          "idea",

        createdAt:
          now,

        updatedAt:
          now,
      }),
    );

  /* -------------------------------------------------------
     FINAL RESULT
  ------------------------------------------------------- */

  return {
    experiments:
      generatedExperiments,

    generatedAt:
      data.generatedAt ??
      data.result?.generatedAt ??
      now,

    marketContext,
  };
}

/* =========================================================
   GEMINI VISUAL PROTOTYPE GENERATION
========================================================= */

export async function generateCraftLabPrototype(
  experiment: CraftExperiment,
  craftDNA: CraftDNA,
  baseImage?: string,
): Promise<CraftLabPrototypeResult> {
  const response =
    await fetch(
      "/api/craft-lab/prototype",
      {
        method:
          "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          experiment,

          craftDNA,

          baseImage,
        }),
      },
    );

  /* -------------------------------------------------------
     HANDLE HTTP ERRORS
  ------------------------------------------------------- */

  if (!response.ok) {
    let message =
      "Visual prototype generation failed.";

    try {
      const errorData =
        (await response.json()) as {
          error?: string;
        };

      if (
        typeof errorData.error ===
          "string" &&
        errorData.error.trim()
      ) {
        message =
          errorData.error.trim();
      }
    } catch {
      /*
       * Keep fallback message when
       * server response isn't JSON.
       */
    }

    throw new Error(
      message,
    );
  }

  /* -------------------------------------------------------
     READ RESPONSE
  ------------------------------------------------------- */

  const data =
    (await response.json()) as {
      success?: boolean;

      result?: {
        imageDataUrl: string;
        generatedAt: string;
      };

      error?: string;
    };

  if (
    !data.success ||
    !data.result
  ) {
    throw new Error(
      data.error ||
        "Gemini did not return a visual prototype.",
    );
  }

  return {
    imageDataUrl:
      data.result.imageDataUrl,

    generatedAt:
      data.result.generatedAt,
  };
}