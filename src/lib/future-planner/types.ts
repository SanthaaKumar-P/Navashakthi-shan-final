/* =========================================================
   NAVSHAKTHI FUTURE PLANNER
   Shared Types
   ========================================================= */

/* =========================================================
   DEMAND
========================================================= */

export type FuturePlannerDemandTrend =
  | "rising"
  | "stable"
  | "falling"
  | "insufficient_data";

/* =========================================================
   OPPORTUNITY
========================================================= */

export type FuturePlannerOpportunity =
  | "high"
  | "medium"
  | "low"
  | "insufficient_data";

/* =========================================================
   PRODUCTION RECOMMENDATION
========================================================= */

export type FuturePlannerRecommendation =
  | "increase_production"
  | "maintain_production"
  | "experiment"
  | "reduce_production"
  | "insufficient_data";

/* =========================================================
   SEASONAL OPPORTUNITY
========================================================= */

export type FuturePlannerSeasonalLevel =
  | "high"
  | "medium"
  | "low"
  | "none";

/* =========================================================
   DATA QUALITY
========================================================= */

export type FuturePlannerDataQuality =
  | "high"
  | "medium"
  | "limited";

/* =========================================================
   GOVERNMENT EVENT
========================================================= */

export type GovernmentEvent = {
  /**
   * Event name.
   *
   * Example:
   * Gandhi Shilp Bazar
   */
  title: string;

  /**
   * Government event category/type.
   */
  type: string;

  /**
   * Event start date.
   *
   * ISO format:
   * YYYY-MM-DD
   */
  startDate: string;

  /**
   * Event end date.
   *
   * ISO format:
   * YYYY-MM-DD
   */
  endDate: string;

  /**
   * Application closing date,
   * if published by the source.
   */
  applyClosingDate: string | null;

  /**
   * Official source URL.
   */
  sourceUrl: string;
};

/* =========================================================
   GOVERNMENT SOURCE SNAPSHOT
========================================================= */

export type GovernmentSourceSnapshot = {
  /**
   * Stable internal identifier.
   *
   * Examples:
   * tradestat
   * odop
   * dc-handicrafts-events
   */
  sourceId: string;

  /**
   * Human-readable official source name.
   */
  name: string;

  /**
   * Official source URL.
   */
  url: string;

  /**
   * All sources in this interface are
   * Government sources.
   */
  type: "government";

  /**
   * When NAVSHAKTHI observed/fetched
   * the source.
   */
  observedAt: string;

  /**
   * Availability state.
   */
  status:
    | "live"
    | "available"
    | "unavailable";

  /**
   * Explanation of what this source
   * contributes to Future Planner.
   */
  note: string;
};

/* =========================================================
   TRADE OBSERVATION
========================================================= */

/**
 * Normalized trade observation.
 *
 * This is intentionally independent of
 * TRADESTAT's raw response format.
 *
 * That allows us to change the source adapter
 * without changing the forecast engine.
 */
export type TradeObservation = {
  /**
   * Period represented by this observation.
   *
   * Example:
   * 2026-06
   */
  period: string;

  /**
   * Export value in INR.
   */
  exportValueInr: number;

  /**
   * Export quantity when available.
   */
  quantity: number | null;

  /**
   * Unit used by the source,
   * when available.
   */
  quantityUnit: string | null;

  /**
   * Government commodity/category label.
   */
  commodity: string;

  /**
   * Country, if country-level data
   * is being used.
   */
  country: string | null;
};

/* =========================================================
   TRADE SERIES
========================================================= */

export type TradeSeries = {
  /**
   * Government category that was mapped
   * to the artisan's craft.
   */
  category: string;

  /**
   * Normalized monthly observations.
   */
  observations: TradeObservation[];

  /**
   * Source information.
   */
  source: GovernmentSourceSnapshot;
};

/* =========================================================
   ODOP OPPORTUNITY
========================================================= */

export type OdopOpportunity = {
  /**
   * Whether the craft appears to have
   * an ODOP relationship.
   */
  relevant: boolean;

  /**
   * Matched district, when available.
   */
  district: string | null;

  /**
   * Matched state, when available.
   */
  state: string | null;

  /**
   * Official ODOP product label.
   */
  product: string | null;

  /**
   * Confidence of the text/category match.
   *
   * This is NAVSHAKTHI's matching confidence,
   * not an official Government confidence value.
   */
  matchConfidence: number;

  /**
   * Official source.
   */
  source: GovernmentSourceSnapshot;
};

/* =========================================================
   CRAFT → GOVERNMENT MARKET MAPPING
========================================================= */

export type CraftMarketMapping = {
  /**
   * NAVSHAKTHI craft category.
   */
  category: string;

  /**
   * Specific craft/product detected.
   */
  productType: string;

  /**
   * Detected primary material.
   */
  material: string;

  /**
   * Search terms useful for Government
   * handicraft sources.
   */
  governmentKeywords: string[];

  /**
   * Relevant trade/commodity labels.
   */
  tradeCategories: string[];

  /**
   * Relevant ODOP search terms.
   */
  odopKeywords: string[];

  /**
   * Relevant official handicraft-event terms.
   */
  handicraftEventKeywords: string[];
};

/* =========================================================
   MARKET SIGNAL
========================================================= */

export type MarketSignal = {
  /**
   * Trade/export momentum.
   *
   * Positive = improving
   * Negative = weakening
   * null = insufficient data
   */
  tradeMomentum: number | null;

  /**
   * Category momentum.
   *
   * Positive = improving
   * Negative = weakening
   */
  categoryMomentum: number | null;

  /**
   * Government event opportunity score.
   *
   * 0–100
   */
  eventOpportunity: number;

  /**
   * ODOP relevance score.
   *
   * 0–100
   */
  odopRelevance: number;

  /**
   * Overall direction.
   */
  demandTrend: FuturePlannerDemandTrend;

  /**
   * Seasonality/opportunity classification.
   */
  seasonalLevel: FuturePlannerSeasonalLevel;

  /**
   * Human-readable explanations.
   */
  reasons: string[];
};

/* =========================================================
   FORECAST
========================================================= */

export type ForecastResult = {
  /**
   * Estimated future selling-price range
   * for approximately three months ahead.
   *
   * This is NAVSHAKTHI's calculated outlook.
   * It is NOT an official Government forecast.
   */
  outlook3Month: {
    low: number;
    high: number;
  };

  /**
   * Estimated future selling-price range
   * for approximately six months ahead.
   *
   * This is NAVSHAKTHI's calculated outlook.
   * It is NOT an official Government forecast.
   */
  outlook6Month: {
    low: number;
    high: number;
  };

  /**
   * Market direction.
   */
  demandTrend: FuturePlannerDemandTrend;

  /**
   * Calculated momentum.
   */
  demandMomentum: number | null;

  /**
   * Overall opportunity score.
   */
  opportunityScore: number | null;

  /**
   * Human-readable opportunity level.
   */
  opportunityLevel: FuturePlannerOpportunity;

  /**
   * Production action.
   */
  recommendation: FuturePlannerRecommendation;

  /**
   * Explainable reasons.
   */
  reasons: string[];

  /**
   * Seasonal opportunity.
   */
  seasonalOpportunity: {
    level: FuturePlannerSeasonalLevel;

    reason: string;
  };
};

/* =========================================================
   FUTURE PLANNER RESULT
========================================================= */

export type FuturePlannerResult = {
  /**
   * When the analysis was generated.
   */
  generatedAt: string;

  /**
   * Forecast result.
   */
  forecast: ForecastResult;

  /**
   * Government opportunity events.
   */
  governmentOpportunity: {
    relevant: boolean;

    events: GovernmentEvent[];

    reason: string;
  };

  /**
   * ODOP opportunity.
   */
  odopOpportunity: OdopOpportunity | null;

  /**
   * Craft → Government market mapping.
   */
  marketMapping: CraftMarketMapping;

  /**
   * Evidence quality.
   */
  dataQuality: FuturePlannerDataQuality;

  /**
   * Sources used.
   */
  sources: GovernmentSourceSnapshot[];
};

/* =========================================================
   FUTURE PLANNER API INPUT
========================================================= */

export type FuturePlannerInput = {
  /**
   * AI-detected craft category.
   *
   * Example:
   * Pottery
   */
  category: string;

  /**
   * AI-detected product type.
   *
   * Example:
   * Terracotta Water Pot
   */
  productType: string;

  /**
   * AI-detected primary material.
   *
   * Example:
   * Clay
   */
  material: string;

  /**
   * Current NAVSHAKTHI recommended
   * low price.
   */
  currentLow: number;

  /**
   * Current NAVSHAKTHI recommended
   * high price.
   */
  currentHigh: number;

  /**
   * Optional craft complexity.
   *
   * Expected range:
   * 1–10
   */
  complexity?: number;

  /**
   * Optional artisan state.
   *
   * Useful for regional opportunity matching.
   */
  state?: string;

  /**
   * Optional artisan district.
   *
   * Useful for ODOP matching.
   */
  district?: string;
};

/* =========================================================
   FUTURE PLANNER API RESPONSE
========================================================= */

export type FuturePlannerApiResponse =
  | {
      success: true;

      result: FuturePlannerResult;
    }
  | {
      success: false;

      error: string;

      details?: string;
    };