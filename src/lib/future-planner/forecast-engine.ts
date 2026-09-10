/* =========================================================
   NAVSHAKTHI FUTURE PLANNER
   Forecast + Production Recommendation Engine
   ========================================================= */

import type {
  ForecastResult,
  MarketSignal,
  FuturePlannerRecommendation,
} from "./types";

/* =========================================================
   CONSTANTS
========================================================= */

const MIN_PRICE = 1;

const MAX_MOMENTUM_EFFECT = 0.20;

const MAX_EVENT_EFFECT = 0.15;

const MAX_SEASONAL_EFFECT = 0.08;

/* =========================================================
   HELPERS
========================================================= */

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, value),
  );
}

function roundToNearestTen(
  value: number,
): number {
  return Math.max(
    MIN_PRICE,
    Math.round(value / 10) * 10,
  );
}

function normalizeRange(
  low: number,
  high: number,
): {
  low: number;
  high: number;
} {
  const safeLow =
    Number.isFinite(low)
      ? Math.max(
          MIN_PRICE,
          low,
        )
      : MIN_PRICE;

  const safeHigh =
    Number.isFinite(high)
      ? Math.max(
          safeLow,
          high,
        )
      : safeLow;

  return {
    low: safeLow,
    high: safeHigh,
  };
}

/* =========================================================
   MOMENTUM FACTOR
========================================================= */

/**
 * Converts market momentum into a bounded
 * price influence factor.
 *
 * Example:
 *
 * +10% momentum
 *       ↓
 * +10% influence
 *
 * Strong signals are deliberately capped.
 *
 * The planner must never produce extreme
 * prices from one noisy signal.
 */
function calculateMomentumFactor(
  momentum:
    | number
    | null
    | undefined,
): number {
  if (
    momentum === null ||
    momentum === undefined ||
    !Number.isFinite(momentum)
  ) {
    return 0;
  }

  return clamp(
    momentum / 100,
    -MAX_MOMENTUM_EFFECT,
    MAX_MOMENTUM_EFFECT,
  );
}

/* =========================================================
   EVENT FACTOR
========================================================= */

/**
 * Government event opportunity contributes a
 * positive opportunity signal.
 *
 * It does NOT mean:
 *
 * "Government event = price will definitely rise."
 *
 * It means:
 *
 * "There may be an additional market-access
 * opportunity during this period."
 */
function calculateEventFactor(
  eventOpportunity: number,
): number {
  if (
    !Number.isFinite(
      eventOpportunity,
    ) ||
    eventOpportunity <= 0
  ) {
    return 0;
  }

  return clamp(
    eventOpportunity / 100,
    0,
    MAX_EVENT_EFFECT,
  );
}

/* =========================================================
   SEASONAL FACTOR
========================================================= */

function calculateSeasonalFactor(
  level: MarketSignal["seasonalLevel"],
): number {
  switch (level) {
    case "high":
      return MAX_SEASONAL_EFFECT;

    case "medium":
      return MAX_SEASONAL_EFFECT * 0.55;

    case "low":
      return MAX_SEASONAL_EFFECT * 0.20;

    case "none":
    default:
      return 0;
  }
}

/* =========================================================
   COMBINED OUTLOOK FACTOR
========================================================= */

function calculateOutlookFactor(
  signal: MarketSignal,
  horizon: "three_month" | "six_month",
): number {
  const momentum =
    calculateMomentumFactor(
      signal.tradeMomentum ??
        signal.categoryMomentum,
    );

  const event =
    calculateEventFactor(
      signal.eventOpportunity,
    );

  const seasonal =
    calculateSeasonalFactor(
      signal.seasonalLevel,
    );

  /*
   * Shorter horizon:
   *
   * Current signals should matter more.
   */
  if (
    horizon === "three_month"
  ) {
    return clamp(
      momentum * 0.45 +
        event * 0.75 +
        seasonal * 0.65,
      -0.30,
      0.30,
    );
  }

  /*
   * Longer horizon:
   *
   * Momentum has more influence,
   * but event signals are still useful.
   */
  return clamp(
    momentum * 0.75 +
      event * 0.55 +
      seasonal * 0.80,
    -0.35,
    0.35,
  );
}

/* =========================================================
   PRICE OUTLOOK
========================================================= */

function calculatePriceOutlook(
  currentLow: number,
  currentHigh: number,
  factor: number,
): {
  low: number;
  high: number;
} {
  const range =
    normalizeRange(
      currentLow,
      currentHigh,
    );

  /*
   * Apply the factor to both ends.
   */
  let low =
    range.low *
    (1 + factor);

  let high =
    range.high *
    (1 + factor);

  /*
   * Keep the forecast ordered.
   */
  if (high < low) {
    [low, high] = [
      high,
      low,
    ];
  }

  /*
   * Never return zero/negative prices.
   */
  low =
    Math.max(
      MIN_PRICE,
      low,
    );

  high =
    Math.max(
      low,
      high,
    );

  return {
    low: roundToNearestTen(
      low,
    ),

    high: roundToNearestTen(
      high,
    ),
  };
}

/* =========================================================
   DEMAND MOMENTUM
========================================================= */

function getDemandMomentum(
  signal: MarketSignal,
): number | null {
  if (
    signal.tradeMomentum !==
      null &&
    signal.tradeMomentum !==
      undefined &&
    Number.isFinite(
      signal.tradeMomentum,
    )
  ) {
    return signal.tradeMomentum;
  }

  if (
    signal.categoryMomentum !==
      null &&
    signal.categoryMomentum !==
      undefined &&
    Number.isFinite(
      signal.categoryMomentum,
    )
  ) {
    return signal.categoryMomentum;
  }

  return null;
}

/* =========================================================
   OPPORTUNITY SCORE
========================================================= */

function calculateOpportunityScore(
  signal: MarketSignal,
): number | null {
  const momentum =
    getDemandMomentum(
      signal,
    );

  const hasMomentum =
    momentum !== null;

  const hasEvent =
    Number.isFinite(
      signal.eventOpportunity,
    ) &&
    signal.eventOpportunity > 0;

  const hasOdop =
    Number.isFinite(
      signal.odopRelevance,
    ) &&
    signal.odopRelevance > 0;

  if (
    !hasMomentum &&
    !hasEvent &&
    !hasOdop
  ) {
    return null;
  }

  let score = 40;

  if (hasMomentum) {
    score +=
      momentum! * 1.2;
  }

  if (hasEvent) {
    score +=
      signal.eventOpportunity *
      0.25;
  }

  if (hasOdop) {
    score +=
      signal.odopRelevance *
      0.15;
  }

  return Math.round(
    clamp(
      score,
      0,
      100,
    ),
  );
}

/* =========================================================
   OPPORTUNITY LEVEL
========================================================= */

function getOpportunityLevel(
  score: number | null,
): ForecastResult["opportunityLevel"] {
  if (
    score === null ||
    !Number.isFinite(score)
  ) {
    return "insufficient_data";
  }

  if (score >= 75) {
    return "high";
  }

  if (score >= 55) {
    return "medium";
  }

  return "low";
}

/* =========================================================
   PRODUCTION RECOMMENDATION
========================================================= */

function calculateRecommendation(
  signal: MarketSignal,
  opportunityLevel:
    ForecastResult["opportunityLevel"],
): FuturePlannerRecommendation {
  const momentum =
    getDemandMomentum(
      signal,
    );

  /*
   * No evidence:
   * don't pretend to know what the artisan
   * should produce.
   */
  if (
    momentum === null &&
    opportunityLevel ===
      "insufficient_data"
  ) {
    return "insufficient_data";
  }

  /*
   * Strong positive evidence + high opportunity.
   */
  if (
    signal.demandTrend ===
      "rising" &&
    opportunityLevel ===
      "high"
  ) {
    return "increase_production";
  }

  /*
   * Strong negative evidence + low opportunity.
   */
  if (
    signal.demandTrend ===
      "falling" &&
    opportunityLevel ===
      "low"
  ) {
    return "reduce_production";
  }

  /*
   * Moderate opportunity:
   * test variants instead of committing
   * to large production.
   */
  if (
    opportunityLevel ===
      "medium"
  ) {
    return "experiment";
  }

  /*
   * Rising demand but insufficient market
   * access evidence:
   * maintain production rather than blindly scaling.
   */
  if (
    signal.demandTrend ===
      "rising"
  ) {
    return "maintain_production";
  }

  /*
   * Falling demand:
   * reduce only when the opportunity score
   * is also low.
   */
  if (
    signal.demandTrend ===
      "falling"
  ) {
    return "reduce_production";
  }

  return "maintain_production";
}

/* =========================================================
   RECOMMENDATION TEXT
========================================================= */

function recommendationReason(
  recommendation: FuturePlannerRecommendation,
): string {
  switch (recommendation) {
    case "increase_production":
      return (
        "Signals indicate a favourable opportunity window. Consider increasing production gradually rather than committing all capacity at once."
      );

    case "experiment":
      return (
        "Signals show a moderate opportunity. Test a small batch or new variant before scaling production."
      );

    case "reduce_production":
      return (
        "Current signals are relatively weak. Consider reducing production exposure and focusing on proven variants."
      );

    case "maintain_production":
      return (
        "Current evidence does not justify a major production change. Maintain the existing range and continue observing market signals."
      );

    case "insufficient_data":
    default:
      return (
        "There is not enough reliable market evidence to recommend a production change."
      );
  }
}

/* =========================================================
   FORECAST REASONS
========================================================= */

function buildForecastReasons(
  signal: MarketSignal,
  recommendation: FuturePlannerRecommendation,
): string[] {
  const reasons: string[] = [];

  const momentum =
    getDemandMomentum(
      signal,
    );

  if (
    momentum !== null
  ) {
    if (momentum >= 8) {
      reasons.push(
        `Market momentum is positive at approximately ${momentum.toFixed(1)}%.`,
      );
    } else if (
      momentum <= -8
    ) {
      reasons.push(
        `Market momentum is negative at approximately ${momentum.toFixed(1)}%.`,
      );
    } else {
      reasons.push(
        `Market momentum is relatively stable at approximately ${momentum.toFixed(1)}%.`,
      );
    }
  } else {
    reasons.push(
      "No sufficient normalized trade momentum is available.",
    );
  }

  if (
    signal.eventOpportunity > 0
  ) {
    reasons.push(
      `Government event opportunity is ${Math.round(signal.eventOpportunity)}/100.`,
    );
  }

  if (
    signal.odopRelevance > 0
  ) {
    reasons.push(
      `ODOP relevance signal is ${Math.round(signal.odopRelevance)}/100.`,
    );
  }

  if (
    signal.seasonalLevel !==
      "none"
  ) {
    reasons.push(
      `Seasonal opportunity is classified as ${signal.seasonalLevel}.`,
    );
  }

  reasons.push(
    recommendationReason(
      recommendation,
    ),
  );

  return reasons;
}

/* =========================================================
   COMPLETE FORECAST
========================================================= */

export function generateForecast(
  currentLow: number,
  currentHigh: number,
  signal: MarketSignal,
): ForecastResult {
  const threeMonthFactor =
    calculateOutlookFactor(
      signal,
      "three_month",
    );

  const sixMonthFactor =
    calculateOutlookFactor(
      signal,
      "six_month",
    );

  const outlook3Month =
    calculatePriceOutlook(
      currentLow,
      currentHigh,
      threeMonthFactor,
    );

  const outlook6Month =
    calculatePriceOutlook(
      currentLow,
      currentHigh,
      sixMonthFactor,
    );

  const demandMomentum =
    getDemandMomentum(
      signal,
    );

  const opportunityScore =
    calculateOpportunityScore(
      signal,
    );

  const opportunityLevel =
    getOpportunityLevel(
      opportunityScore,
    );

  const recommendation =
    calculateRecommendation(
      signal,
      opportunityLevel,
    );

  const seasonalOpportunity =
    getSeasonalOpportunity(
      signal,
    );

  return {
    outlook3Month,

    outlook6Month,

    demandTrend:
      signal.demandTrend,

    demandMomentum,

    opportunityScore,

    opportunityLevel,

    recommendation,

    reasons:
      buildForecastReasons(
        signal,
        recommendation,
      ),

    seasonalOpportunity,
  };
}

/* =========================================================
   SEASONAL OPPORTUNITY
========================================================= */

function getSeasonalOpportunity(
  signal: MarketSignal,
): ForecastResult["seasonalOpportunity"] {
  switch (
    signal.seasonalLevel
  ) {
    case "high":
      return {
        level: "high",

        reason:
          "Strong seasonal or Government-event opportunity detected. Consider preparing inventory early.",
      };

    case "medium":
      return {
        level: "medium",

        reason:
          "Moderate seasonal opportunity detected. A small targeted batch may be appropriate.",
      };

    case "low":
      return {
        level: "low",

        reason:
          "Only a limited seasonal signal is present.",
      };

    case "none":
    default:
      return {
        level: "none",

        reason:
          "No strong seasonal opportunity was detected.",
      };
  }
}

/* =========================================================
   PRICE CHANGE SUMMARY
========================================================= */

export function getForecastChangePercent(
  currentLow: number,
  currentHigh: number,
  forecast:
    | {
        low: number;
        high: number;
      },
): {
  lowPercent: number;
  highPercent: number;
} {
  const current =
    normalizeRange(
      currentLow,
      currentHigh,
    );

  const lowPercent =
    current.low > 0
      ? ((forecast.low -
          current.low) /
          current.low) *
        100
      : 0;

  const highPercent =
    current.high > 0
      ? ((forecast.high -
          current.high) /
          current.high) *
        100
      : 0;

  return {
    lowPercent:
      Math.round(
        lowPercent * 10,
      ) / 10,

    highPercent:
      Math.round(
        highPercent * 10,
      ) / 10,
  };
}

/* =========================================================
   HUMAN-READABLE RECOMMENDATION LABEL
========================================================= */

export function getRecommendationLabel(
  recommendation: FuturePlannerRecommendation,
): string {
  switch (recommendation) {
    case "increase_production":
      return "Increase production";

    case "maintain_production":
      return "Maintain production";

    case "experiment":
      return "Experiment with a small batch";

    case "reduce_production":
      return "Reduce production exposure";

    case "insufficient_data":
    default:
      return "More market data needed";
  }
}

/* =========================================================
   HUMAN-READABLE TREND LABEL
========================================================= */

export function getDemandTrendLabel(
  trend: MarketSignal["demandTrend"],
): string {
  switch (trend) {
    case "rising":
      return "Rising";

    case "stable":
      return "Stable";

    case "falling":
      return "Falling";

    case "insufficient_data":
    default:
      return "Insufficient data";
  }
}

/* =========================================================
   HUMAN-READABLE OPPORTUNITY LABEL
========================================================= */

export function getOpportunityLabel(
  level:
    | "high"
    | "medium"
    | "low"
    | "insufficient_data",
): string {
  switch (level) {
    case "high":
      return "High opportunity";

    case "medium":
      return "Medium opportunity";

    case "low":
      return "Low opportunity";

    case "insufficient_data":
    default:
      return "Insufficient data";
  }
}