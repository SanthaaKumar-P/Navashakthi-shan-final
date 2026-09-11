/* =========================================================
   NAVSHAKTHI - SHARED CRAFT DRAFT
   =========================================================
   This file is the single shared state for the artisan
   publishing workflow.

   Flow:

   Image
     ↓
   Image Enhancement
     ↓
   Craft Analysis / Craft DNA
     ↓
   Smart Cataloger
     ↓
   Smart Pricing
     ↓
   Future Planner
     ↓
   Voice Verification
     ↓
   Human Review
     ↓
   Final Selling Price
     ↓
   Publish
========================================================= */

import type { CraftDNA } from "@/lib/craft-dna/types";

/* =========================================================
   IMAGE DRAFT
========================================================= */

export type CraftImageDraft = {
  originalImage: string | null;

  enhancedImage: string | null;

  imageScore: {
    sharpness: number;
    exposure: number;
    contrast: number;
  } | null;

  afterImageScore: {
    sharpness: number;
    exposure: number;
    contrast: number;
  } | null;

  backgroundRemovedPercent: number;
};

/* =========================================================
   FUTURE PLANNER TYPES
========================================================= */

export type FuturePlannerDemandTrend =
  | "rising"
  | "stable"
  | "falling"
  | "insufficient_data";

export type FuturePlannerOpportunity =
  | "high"
  | "medium"
  | "low"
  | "insufficient_data";

export type FuturePlannerRecommendation =
  | "increase_production"
  | "maintain_production"
  | "experiment"
  | "reduce_production"
  | "insufficient_data";

export type FuturePlannerSeasonalLevel =
  | "high"
  | "medium"
  | "low"
  | "none";

export type FuturePlannerDataQuality =
  | "high"
  | "medium"
  | "limited";

/* =========================================================
   FUTURE PLANNER SOURCE
========================================================= */

export type FuturePlannerSource = {
  /**
   * Stable identifier for the source.
   */
  sourceId: string;

  /**
   * Human-readable source name.
   */
  name: string;

  /**
   * Official/source URL.
   */
  url: string;

  /**
   * Where the information came from.
   */
  type:
    | "government"
    | "navashakthi_reference";

  /**
   * When NAVSHAKTHI observed/fetched the source.
   */
  observedAt: string;

  /**
   * Additional source context.
   */
  note: string;
};

/* =========================================================
   GOVERNMENT OPPORTUNITY EVENT
========================================================= */

export type FuturePlannerGovernmentEvent = {
  title: string;

  type: string;

  startDate: string;

  endDate: string;

  applyClosingDate: string | null;

  sourceUrl: string;
};

/* =========================================================
   FUTURE PLANNER
========================================================= */

export type FuturePlanner = {
  /**
   * Timestamp when the planner result was generated.
   */
  generatedAt: string;

  /**
   * Expected price outlook approximately
   * three months from the current analysis.
   *
   * This is NAVSHAKTHI decision-support output,
   * not an official government forecast.
   */
  outlook3Month: {
    low: number;
    high: number;
  };

  /**
   * Expected price outlook approximately
   * six months from the current analysis.
   *
   * This is NAVSHAKTHI decision-support output,
   * not an official government forecast.
   */
  outlook6Month: {
    low: number;
    high: number;
  };

  /**
   * Overall market direction.
   */
  demandTrend: FuturePlannerDemandTrend;

  /**
   * Calculated market momentum.
   *
   * Positive  = improving
   * Zero      = stable
   * Negative  = weakening
   *
   * null means there is not enough reliable data.
   */
  demandMomentum: number | null;

  /**
   * Overall opportunity score from 0 to 100.
   *
   * null means insufficient evidence.
   */
  opportunityScore: number | null;

  /**
   * Human-readable opportunity level.
   */
  opportunityLevel: FuturePlannerOpportunity;

  /**
   * Recommended production action.
   */
  recommendation: FuturePlannerRecommendation;

  /**
   * Explainable reasons behind the recommendation.
   */
  reasons: string[];

  /**
   * Seasonal opportunity detected from
   * available market/event signals.
   */
  seasonalOpportunity: {
    level: FuturePlannerSeasonalLevel;

    reason: string;
  };

  /**
   * Government opportunity information.
   */
  governmentOpportunity: {
    relevant: boolean;

    events: FuturePlannerGovernmentEvent[];

    reason: string;
  };

  /**
   * Overall quality of available evidence.
   */
  dataQuality: FuturePlannerDataQuality;

  /**
   * Sources used to generate the result.
   */
  sources: FuturePlannerSource[];
};

/* =========================================================
   CATALOG DRAFT
========================================================= */

export type CraftCatalogDraft = {
  detectedLanguage: string;

  transcript: string;

  /**
   * Structured product attributes.
   *
   * This remains flexible because Smart Cataloger
   * can discover additional domain-specific fields.
   */
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

/* =========================================================
   PRICING DRAFT
========================================================= */

export type CraftPricingDraft = {
  /* -------------------------------------------------------
     CURRENT PRICING INPUTS
  ------------------------------------------------------- */

  materialCost: number;

  labourBenchmark: number;

  estimatedLabourCost: number;

  packaging: number;

  overhead: number;

  sustainableFloor: number;

  /* -------------------------------------------------------
     CURRENT MARKET REFERENCE
  ------------------------------------------------------- */

  marketBenchmark: number;

  /* -------------------------------------------------------
     CURRENT AI-ASSISTED PRICE
  ------------------------------------------------------- */

  recommended: number;

  low: number;

  high: number;

  confidence: number;

  /* -------------------------------------------------------
     MARKET DATA
  ------------------------------------------------------- */

  market: {
    low: number;

    median: number;

    high: number;

    demandChange: number;

    comparableCount: number;

    matchLabel: string;

    sourceType:
      | "curated_reference"
      | "official_reference";

    sourceLabel: string;

    updatedAt: string;

    materialCostReference: number;

    labourBenchmark: number;
  } | null;

  /* -------------------------------------------------------
     FUTURE PLANNER
  -------------------------------------------------------

     Optional for backward compatibility.

     Existing localStorage drafts created before
     Future Planner was introduced will continue
     working even if this field does not exist.
  ------------------------------------------------------- */

  futurePlanner?: FuturePlanner | null;
};

/* =========================================================
   SHARED CRAFT DRAFT
========================================================= */

export type CraftDraft = {
  /**
   * Unique identifier for the craft workflow.
   */
  id: string;

  /**
   * Image processing state.
   */
  image: CraftImageDraft | null;

  /**
   * Catalog generation state.
   */
  catalog: CraftCatalogDraft | null;

  /**
   * Pricing + Future Planner state.
   */
  pricing: CraftPricingDraft | null;

  /**
   * =======================================================
   * CRAFT DNA
   * =======================================================
   *
   * Reusable structured identity of the craft.
   *
   * Generated primarily from image-derived attributes
   * and reused by:
   *
   * - Smart Cataloger
   * - Smart Pricing
   * - Future Planner
   * - Authentication
   * - Voice Verification
   * - Marketplace
   *
   * null means DNA has not been generated yet.
   */
  craftDNA: CraftDNA | null;

  /**
   * The actual customer-facing selling price
   * chosen by the artisan.
   *
   * IMPORTANT:
   * AI pricing is advisory only.
   * AI must NEVER populate this automatically.
   */
  finalSellingPrice: number | null;

  /**
   * Current lifecycle status.
   */
  status: "draft" | "published";

  /**
   * Creation timestamp.
   */
  createdAt: string;

  /**
   * Last update timestamp.
   */
  updatedAt: string;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

export const CRAFT_DRAFT_STORAGE_KEY =
  "navshakthi_craft_draft_v1";

export const ARTISAN_LISTINGS_STORAGE_KEY =
  "navshakthi_artisan_listings_v1";

/* =========================================================
   BROWSER CHECK
========================================================= */

function isBrowser() {
  return typeof window !== "undefined";
}

/* =========================================================
   EMPTY DRAFT
========================================================= */

function createEmptyDraft(): CraftDraft {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),

    image: null,

    catalog: null,

    pricing: null,

    /*
     * New Craft DNA state.
     */
    craftDNA: null,

    finalSellingPrice: null,

    status: "draft",

    createdAt: now,

    updatedAt: now,
  };
}

/* =========================================================
   GET CURRENT CRAFT DRAFT
========================================================= */

export function getCraftDraft(): CraftDraft | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw =
      localStorage.getItem(
        CRAFT_DRAFT_STORAGE_KEY,
      );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw) as Partial<CraftDraft>;

    /*
     * Backward-compatible migration.
     *
     * Existing drafts created before Craft DNA
     * was introduced are still valid.
     *
     * Missing craftDNA simply becomes null.
     */

    return {
      ...parsed,

      id:
        parsed.id ??
        crypto.randomUUID(),

      image:
        parsed.image ??
        null,

      catalog:
        parsed.catalog ??
        null,

      pricing:
        parsed.pricing ??
        null,

      craftDNA:
        parsed.craftDNA ??
        null,

      finalSellingPrice:
        typeof parsed.finalSellingPrice ===
          "number" &&
        Number.isFinite(
          parsed.finalSellingPrice,
        ) &&
        parsed.finalSellingPrice > 0
          ? Math.round(
              parsed.finalSellingPrice,
            )
          : null,

      status:
        parsed.status ??
        "draft",

      createdAt:
        parsed.createdAt ??
        new Date().toISOString(),

      updatedAt:
        parsed.updatedAt ??
        new Date().toISOString(),
    } as CraftDraft;
  } catch (error) {
    console.error(
      "Failed to read craft draft:",
      error,
    );

    return null;
  }
}

/* =========================================================
   GET OR CREATE DRAFT
========================================================= */

export function getOrCreateCraftDraft(): CraftDraft {
  const existing =
    getCraftDraft();

  if (existing) {
    return existing;
  }

  const draft =
    createEmptyDraft();

  if (isBrowser()) {
    localStorage.setItem(
      CRAFT_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
  }

  return draft;
}

/* =========================================================
   SAVE SHARED DRAFT
========================================================= */

export function saveCraftDraft(
  updates: Partial<CraftDraft>,
): CraftDraft {
  const current =
    getOrCreateCraftDraft();

  const updated: CraftDraft = {
    ...current,

    ...updates,

    image:
      updates.image !== undefined
        ? updates.image
        : current.image,

    catalog:
      updates.catalog !== undefined
        ? updates.catalog
        : current.catalog,

    pricing:
      updates.pricing !== undefined
        ? updates.pricing
        : current.pricing,

    /*
     * Preserve existing DNA unless a new DNA
     * value is explicitly supplied.
     */
    craftDNA:
      updates.craftDNA !== undefined
        ? updates.craftDNA
        : current.craftDNA,

    finalSellingPrice:
      updates.finalSellingPrice !==
      undefined
        ? updates.finalSellingPrice
        : current.finalSellingPrice,

    updatedAt:
      new Date().toISOString(),
  };

  if (isBrowser()) {
    localStorage.setItem(
      CRAFT_DRAFT_STORAGE_KEY,
      JSON.stringify(updated),
    );

    /*
     * Let connected workflow modules know
     * that the shared draft changed.
     */
    window.dispatchEvent(
      new Event(
        "navshakthi:craft-draft-updated",
      ),
    );
  }

  return updated;
}

/* =========================================================
   SAVE IMAGE
========================================================= */

export function saveCraftImage(
  image: CraftImageDraft,
): CraftDraft {
  return saveCraftDraft({
    image,
  });
}

/* =========================================================
   SAVE CATALOG
========================================================= */

export function saveCraftCatalog(
  catalog: CraftCatalogDraft,
): CraftDraft {
  return saveCraftDraft({
    catalog,
  });
}

/* =========================================================
   SAVE PRICING
========================================================= */

export function saveCraftPricing(
  pricing: CraftPricingDraft,
): CraftDraft {
  return saveCraftDraft({
    pricing,
  });
}

/* =========================================================
   SAVE FUTURE PLANNER
========================================================= */

export function saveFuturePlanner(
  futurePlanner: FuturePlanner,
): CraftDraft {
  const current =
    getOrCreateCraftDraft();

  const currentPricing =
    current.pricing;

  /*
   * Preserve every existing pricing field.
   *
   * Future Planner only updates the planner
   * portion of the pricing state.
   */
  if (!currentPricing) {
    console.warn(
      "Future Planner saved before pricing. Creating a safe pricing container.",
    );
  }

  const pricing: CraftPricingDraft = {
    materialCost:
      currentPricing?.materialCost ??
      0,

    labourBenchmark:
      currentPricing?.labourBenchmark ??
      0,

    estimatedLabourCost:
      currentPricing?.estimatedLabourCost ??
      0,

    packaging:
      currentPricing?.packaging ??
      0,

    overhead:
      currentPricing?.overhead ??
      0,

    sustainableFloor:
      currentPricing?.sustainableFloor ??
      0,

    marketBenchmark:
      currentPricing?.marketBenchmark ??
      0,

    recommended:
      currentPricing?.recommended ??
      0,

    low:
      currentPricing?.low ??
      0,

    high:
      currentPricing?.high ??
      0,

    confidence:
      currentPricing?.confidence ??
      0,

    market:
      currentPricing?.market ??
      null,

    futurePlanner,
  };

  return saveCraftDraft({
    pricing,
  });
}

/* =========================================================
   SAVE CRAFT DNA
========================================================= */

/**
 * Save the reusable Craft DNA profile
 * into the shared Craft Draft.
 *
 * Craft DNA is intentionally stored at the
 * top level of CraftDraft because it is not
 * specific to pricing or catalog generation.
 */
export function saveCraftDNA(
  craftDNA: CraftDNA,
): CraftDraft {
  return saveCraftDraft({
    craftDNA,
  });
}

/* =========================================================
   GET CRAFT DNA
========================================================= */

/**
 * Read the Craft DNA belonging to the
 * currently active shared craft draft.
 */
export function getCraftDNAFromDraft():
  CraftDNA | null {
  return (
    getCraftDraft()
      ?.craftDNA ??
    null
  );
}

/* =========================================================
   SAVE FINAL SELLING PRICE
========================================================= */

/**
 * Save ONLY the artisan-selected
 * customer-facing selling price.
 *
 * AI recommendation must never automatically
 * become the final marketplace price.
 */
export function saveFinalSellingPrice(
  price: number | null,
): CraftDraft {
  const normalized =
    typeof price === "number" &&
    Number.isFinite(price) &&
    price > 0
      ? Math.round(price)
      : null;

  return saveCraftDraft({
    finalSellingPrice:
      normalized,
  });
}

/* =========================================================
   CLEAR CURRENT DRAFT
========================================================= */

export function clearCraftDraft() {
  if (!isBrowser()) {
    return;
  }

  localStorage.removeItem(
    CRAFT_DRAFT_STORAGE_KEY,
  );

  /*
   * Notify connected workflow components.
   */
  window.dispatchEvent(
    new Event(
      "navshakthi:craft-draft-cleared",
    ),
  );
}

/* =========================================================
   GET ARTISAN LISTINGS
========================================================= */

export function getArtisanListings(): CraftDraft[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      localStorage.getItem(
        ARTISAN_LISTINGS_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as CraftDraft[];
  } catch (error) {
    console.error(
      "Failed to read artisan listings:",
      error,
    );

    return [];
  }
}

/* =========================================================
   PUBLISH CURRENT CRAFT
========================================================= */

export function publishCraftDraft():
  CraftDraft | null {
  if (!isBrowser()) {
    return null;
  }

  const draft =
    getCraftDraft();

  if (!draft) {
    return null;
  }

  /*
   * Final selling price MUST be selected
   * by the artisan.
   */
  if (
    !draft.finalSellingPrice ||
    draft.finalSellingPrice <= 0
  ) {
    console.error(
      "Cannot publish craft: artisan selling price is missing.",
    );

    return null;
  }

  /*
   * The complete shared craft state is
   * preserved in the published listing:
   *
   * image
   * catalog
   * pricing
   * futurePlanner
   * craftDNA
   * finalSellingPrice
   */
  const published: CraftDraft = {
    ...draft,

    status: "published",

    updatedAt:
      new Date().toISOString(),
  };

  const listings =
    getArtisanListings();

  const existingIndex =
    listings.findIndex(
      (item) =>
        item.id ===
        published.id,
    );

  if (
    existingIndex >= 0
  ) {
    listings[
      existingIndex
    ] = published;
  } else {
    listings.unshift(
      published,
    );
  }

  localStorage.setItem(
    ARTISAN_LISTINGS_STORAGE_KEY,
    JSON.stringify(
      listings,
    ),
  );

  /*
   * Notify marketplace/customer/admin
   * listeners that a listing changed.
   */
  window.dispatchEvent(
    new Event(
      "navshakthi:craft-published",
    ),
  );

  window.dispatchEvent(
    new Event(
      "navshakthi:listings-updated",
    ),
  );

  /*
   * Remove active draft only after the
   * published listing was successfully stored.
   */
  localStorage.removeItem(
    CRAFT_DRAFT_STORAGE_KEY,
  );

  window.dispatchEvent(
    new Event(
      "navshakthi:craft-draft-cleared",
    ),
  );

  return published;
}

/* =========================================================
   DELETE ARTISAN LISTING
========================================================= */

export function deleteArtisanListing(
  id: string,
) {
  if (!isBrowser()) {
    return;
  }

  const listings =
    getArtisanListings().filter(
      (item) =>
        item.id !== id,
    );

  localStorage.setItem(
    ARTISAN_LISTINGS_STORAGE_KEY,
    JSON.stringify(
      listings,
    ),
  );

  window.dispatchEvent(
    new Event(
      "navshakthi:listings-updated",
    ),
  );
}
/* =========================================================
   CREATE NEW CRAFT DRAFT FROM CRAFT LAB PROTOTYPE
========================================================= */

/**
 * Starts a fresh craft workflow from a Craft Lab
 * visual prototype.
 *
 * The prototype becomes the new working image.
 *
 * Existing Craft DNA is preserved because the new
 * design is still based on the artisan's craft identity.
 *
 * Existing catalog and pricing are intentionally cleared
 * because the prototype is a NEW product experiment.
 */
export function createCraftDraftFromPrototype({
  prototypeImage,
  craftDNA,
}: {
  prototypeImage: string;
  craftDNA: CraftDNA;
}): CraftDraft {
  const now =
    new Date().toISOString();

  const newDraft: CraftDraft = {
    id:
      crypto.randomUUID(),

    image: {
      originalImage:
        prototypeImage,

      enhancedImage:
        prototypeImage,

      imageScore: null,

      afterImageScore: null,

      backgroundRemovedPercent: 0,
    },

    /*
     * New experiment means the previous catalog
     * must not be reused automatically.
     */
    catalog: null,

    /*
     * New experiment also needs fresh pricing.
     */
    pricing: null,

    /*
     * Preserve the artisan's Craft DNA as the
     * identity foundation for this experiment.
     */
    craftDNA,

    /*
     * Final selling price must ALWAYS be chosen
     * by the artisan.
     */
    finalSellingPrice: null,

    status: "draft",

    createdAt: now,

    updatedAt: now,
  };

  if (isBrowser()) {
    localStorage.setItem(
      CRAFT_DRAFT_STORAGE_KEY,
      JSON.stringify(
        newDraft,
      ),
    );

    window.dispatchEvent(
      new Event(
        "navshakthi:craft-draft-updated",
      ),
    );
  }

  return newDraft;
}