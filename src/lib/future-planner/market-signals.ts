/* =========================================================
   NAVSHAKTHI FUTURE PLANNER
   Market Signal Engine
   ========================================================= */

import type {
  GovernmentEvent,
  MarketSignal,
  TradeObservation,
  FuturePlannerDemandTrend,
  FuturePlannerSeasonalLevel,
} from "./types";

/* =========================================================
   CONSTANTS
========================================================= */

const SCORE_MIN = 0;
const SCORE_MAX = 100;

/**
 * Number of months used when looking for
 * near-term government opportunities.
 */
const DEFAULT_EVENT_WINDOW_MONTHS = 6;

/**
 * A small epsilon prevents unstable calculations
 * when an export observation has zero value.
 */
const EPSILON = 0.000001;

/* =========================================================
   CLAMP
========================================================= */

function clamp(
  value: number,
  min = SCORE_MIN,
  max = SCORE_MAX,
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    max,
    Math.max(min, value),
  );
}

/* =========================================================
   ROUND
========================================================= */

function round(
  value: number,
  decimals = 1,
): number {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(value * multiplier) /
    multiplier
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */

function validDate(
  value: string,
): Date | null {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return date;
}

function monthsFromNow(
  date: Date,
  now = new Date(),
): number {
  const diff =
    date.getTime() -
    now.getTime();

  return (
    diff /
    (1000 * 60 * 60 * 24 * 30.4375)
  );
}

/* =========================================================
   EVENT KEYWORD MATCHING
========================================================= */

export function eventMatchesKeywords(
  event: GovernmentEvent,
  keywords: string[],
): boolean {
  const text =
    `${event.title} ${event.type}`
      .toLowerCase();

  return keywords.some((keyword) => {
    const clean =
      keyword
        .trim()
        .toLowerCase();

    if (!clean) {
      return false;
    }

    return text.includes(clean);
  });
}

/* =========================================================
   UPCOMING EVENTS
========================================================= */

export function getUpcomingEvents(
  events: GovernmentEvent[],
  months = DEFAULT_EVENT_WINDOW_MONTHS,
  now = new Date(),
): GovernmentEvent[] {
  return events.filter((event) => {
    const start =
      validDate(event.startDate);

    if (!start) {
      return false;
    }

    const distance =
      monthsFromNow(
        start,
        now,
      );

    return (
      distance >= 0 &&
      distance <= months
    );
  });
}

/* =========================================================
   RELEVANT EVENTS
========================================================= */

export function getRelevantEvents(
  events: GovernmentEvent[],
  keywords: string[],
  months = DEFAULT_EVENT_WINDOW_MONTHS,
  now = new Date(),
): GovernmentEvent[] {
  const upcoming =
    getUpcomingEvents(
      events,
      months,
      now,
    );

  return upcoming.filter(
    (event) =>
      eventMatchesKeywords(
        event,
        keywords,
      ),
  );
}

/* =========================================================
   EVENT OPPORTUNITY SCORE
========================================================= */

/**
 * Government events are treated as an opportunity
 * signal, not as proof that demand will increase.
 *
 * More relevant events within the planning window
 * increase the opportunity score, but the score is
 * deliberately bounded.
 */
export function calculateEventOpportunity(
  events: GovernmentEvent[],
  keywords: string[],
  months = DEFAULT_EVENT_WINDOW_MONTHS,
  now = new Date(),
): number {
  const relevant =
    getRelevantEvents(
      events,
      keywords,
      months,
      now,
    );

  if (!relevant.length) {
    return 0;
  }

  /*
   * Base opportunity.
   *
   * One relevant event already indicates
   * some market access opportunity.
   */
  let score = 35;

  /*
   * Additional relevant events increase
   * the opportunity.
   */
  score +=
    Math.min(
      relevant.length * 15,
      45,
    );

  /*
   * Events happening sooner receive a
   * small additional weight.
   */
  for (const event of relevant) {
    const start =
      validDate(event.startDate);

    if (!start) {
      continue;
    }

    const distance =
      monthsFromNow(
        start,
        now,
      );

    if (distance <= 1) {
      score += 8;
    } else if (distance <= 3) {
      score += 5;
    }
  }

  return Math.round(
    clamp(score),
  );
}

/* =========================================================
   EVENT OPPORTUNITY LEVEL
========================================================= */

export function getEventOpportunityLevel(
  score: number,
): "high" | "medium" | "low" {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "medium";
  }

  return "low";
}

/* =========================================================
   EVENT REASON
========================================================= */

export function getEventOpportunityReason(
  events: GovernmentEvent[],
  keywords: string[],
): string {
  const relevant =
    getRelevantEvents(
      events,
      keywords,
    );

  if (!relevant.length) {
    return (
      "No craft-specific Government handicraft event was found in the current planning window."
    );
  }

  if (relevant.length === 1) {
    return (
      `One relevant Government handicraft opportunity was found: ${relevant[0].title}.`
    );
  }

  return (
    `${relevant.length} relevant Government handicraft opportunities were found in the current planning window.`
  );
}

/* =========================================================
   TRADE OBSERVATION SORTING
========================================================= */

function sortObservations(
  observations: TradeObservation[],
): TradeObservation[] {
  return [...observations].sort(
    (a, b) =>
      a.period.localeCompare(
        b.period,
      ),
  );
}

/* =========================================================
   MONTHLY TRADE AGGREGATION
========================================================= */

function aggregateMonthlyExports(
  observations: TradeObservation[],
): Map<string, number> {
  const monthly =
    new Map<string, number>();

  for (const observation of observations) {
    if (
      !observation.period ||
      !Number.isFinite(
        observation.exportValueInr,
      )
    ) {
      continue;
    }

    const current =
      monthly.get(
        observation.period,
      ) ?? 0;

    monthly.set(
      observation.period,
      current +
        Math.max(
          0,
          observation.exportValueInr,
        ),
    );
  }

  return monthly;
}

/* =========================================================
   TRADE MOMENTUM
========================================================= */

/**
 * Calculates momentum using the average of the
 * earlier half of the observations against the
 * average of the later half.
 *
 * Example:
 *
 * Older average = ₹100
 * Newer average = ₹115
 *
 * Momentum = +15%
 *
 * Result is capped to avoid extreme values
 * dominating the planner.
 */
export function calculateTradeMomentum(
  observations: TradeObservation[],
): number | null {
  const valid =
    observations.filter(
      (observation) =>
        Number.isFinite(
          observation.exportValueInr,
        ) &&
        observation.exportValueInr >= 0 &&
        Boolean(observation.period),
    );

  if (valid.length < 2) {
    return null;
  }

  const monthly =
    aggregateMonthlyExports(
      sortObservations(valid),
    );

  const values =
    [...monthly.values()];

  if (values.length < 2) {
    return null;
  }

  const midpoint =
    Math.floor(
      values.length / 2,
    );

  const older =
    values.slice(
      0,
      midpoint,
    );

  const newer =
    values.slice(
      midpoint,
    );

  if (
    !older.length ||
    !newer.length
  ) {
    return null;
  }

  const olderAverage =
    older.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    older.length;

  const newerAverage =
    newer.reduce(
      (sum, value) =>
        sum + value,
      0,
    ) /
    newer.length;

  if (
    Math.abs(
      olderAverage,
    ) < EPSILON
  ) {
    return null;
  }

  const momentum =
    ((newerAverage -
      olderAverage) /
      Math.abs(
        olderAverage,
      )) *
    100;

  return round(
    clamp(
      momentum,
      -100,
      100,
    ),
    1,
  );
}

/* =========================================================
   CATEGORY MOMENTUM
========================================================= */

/**
 * Category momentum can be supplied by a separate
 * normalized market-data adapter.
 *
 * We intentionally do not infer category momentum
 * from unrelated data.
 */
export function normalizeCategoryMomentum(
  value:
    | number
    | null
    | undefined,
): number | null {
  if (
    value === null ||
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return round(
    clamp(
      value,
      -100,
      100,
    ),
    1,
  );
}

/* =========================================================
   DEMAND TREND
========================================================= */

export function getDemandTrend(
  momentum:
    | number
    | null
    | undefined,
): FuturePlannerDemandTrend {
  if (
    momentum === null ||
    momentum === undefined ||
    !Number.isFinite(momentum)
  ) {
    return "insufficient_data";
  }

  if (momentum >= 8) {
    return "rising";
  }

  if (momentum <= -8) {
    return "falling";
  }

  return "stable";
}

/* =========================================================
   SEASON DETECTION
========================================================= */

/**
 * The planner uses broad seasonal opportunity windows.
 *
 * These are NOT claimed to be Government forecasts.
 *
 * They are a decision-support layer combining
 * common buying periods with official event timing.
 */
function getSeasonalWindow(
  month: number,
): {
  level: FuturePlannerSeasonalLevel;
  reason: string;
} {
  /*
   * October–December:
   * festive + gifting + wedding season.
   */
  if (
    month === 9 ||
    month === 10 ||
    month === 11
  ) {
    return {
      level: "high",

      reason:
        "The planning window overlaps a broad festive, gifting and year-end buying period.",
    };
  }

  /*
   * August–September:
   * preparation period for festive demand.
   */
  if (
    month === 7 ||
    month === 8
  ) {
    return {
      level: "medium",

      reason:
        "The planning window overlaps the pre-festive preparation period.",
    };
  }

  /*
   * January–March:
   * exhibitions and new-year retail cycles.
   */
  if (
    month === 0 ||
    month === 1 ||
    month === 2
  ) {
    return {
      level: "medium",

      reason:
        "The planning window overlaps a period with exhibitions and new-year retail activity.",
    };
  }

  return {
    level: "low",

    reason:
      "No strong broad seasonal window was detected for the selected period.",
  };
}

/* =========================================================
   EVENT-AWARE SEASONALITY
========================================================= */

export function calculateSeasonalOpportunity(
  events: GovernmentEvent[],
  keywords: string[],
  months = DEFAULT_EVENT_WINDOW_MONTHS,
  now = new Date(),
): {
  level: FuturePlannerSeasonalLevel;
  reason: string;
} {
  const relevant =
    getRelevantEvents(
      events,
      keywords,
      months,
      now,
    );

  const base =
    getSeasonalWindow(
      now.getMonth(),
    );

  /*
   * A relevant Government event within
   * the next 3 months upgrades low → medium
   * and medium → high.
   */
  const nearTermEvents =
    relevant.filter(
      (event) => {
        const start =
          validDate(
            event.startDate,
          );

        if (!start) {
          return false;
        }

        return (
          monthsFromNow(
            start,
            now,
          ) <= 3
        );
      },
    );

  if (
    nearTermEvents.length >= 2
  ) {
    return {
      level: "high",

      reason:
        `${nearTermEvents.length} relevant Government opportunities fall within approximately three months, strengthening the near-term opportunity window.`,
    };
  }

  if (
    nearTermEvents.length === 1
  ) {
    if (base.level === "low") {
      return {
        level: "medium",

        reason:
          `A relevant Government opportunity occurs within approximately three months: ${nearTermEvents[0].title}.`,
      };
    }

    return {
      level: base.level,

      reason:
        `${nearTermEvents[0].title} overlaps the current planning window.`,
    };
  }

  return base;
}

/* =========================================================
   OPPORTUNITY SCORE
========================================================= */

export function calculateOpportunityScore(
  momentum:
    | number
    | null
    | undefined,
  eventOpportunity: number,
  odopRelevance = 0,
): number | null {
  const hasMomentum =
    momentum !== null &&
    momentum !== undefined &&
    Number.isFinite(momentum);

  const hasEvent =
    Number.isFinite(
      eventOpportunity,
    ) &&
    eventOpportunity > 0;

  const hasOdop =
    Number.isFinite(
      odopRelevance,
    ) &&
    odopRelevance > 0;

  /*
   * If there is no evidence at all,
   * don't invent a score.
   */
  if (
    !hasMomentum &&
    !hasEvent &&
    !hasOdop
  ) {
    return null;
  }

  let score = 40;

  /*
   * Trade momentum.
   *
   * ±20 momentum contributes approximately
   * ±24 score points.
   */
  if (hasMomentum) {
    score +=
      Number(momentum) * 1.2;
  }

  /*
   * Government event signal.
   */
  if (hasEvent) {
    score +=
      eventOpportunity * 0.25;
  }

  /*
   * ODOP relevance.
   */
  if (hasOdop) {
    score +=
      odopRelevance * 0.15;
  }

  return Math.round(
    clamp(score),
  );
}

/* =========================================================
   OPPORTUNITY LEVEL
========================================================= */

export function getOpportunityLevel(
  score:
    | number
    | null
    | undefined,
): "high" | "medium" | "low" | "insufficient_data" {
  if (
    score === null ||
    score === undefined ||
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
   RECOMMENDATION
========================================================= */

export function getProductionRecommendation(
  demandTrend: FuturePlannerDemandTrend,
  opportunityLevel:
    | "high"
    | "medium"
    | "low"
    | "insufficient_data",
): "increase_production" |
  "maintain_production" |
  "experiment" |
  "reduce_production" |
  "insufficient_data" {
  if (
    demandTrend ===
      "insufficient_data" &&
    opportunityLevel ===
      "insufficient_data"
  ) {
    return "insufficient_data";
  }

  if (
    demandTrend === "rising" &&
    opportunityLevel === "high"
  ) {
    return "increase_production";
  }

  if (
    demandTrend === "falling" &&
    opportunityLevel === "low"
  ) {
    return "reduce_production";
  }

  if (
    demandTrend === "stable" ||
    opportunityLevel === "medium"
  ) {
    return "experiment";
  }

  return "maintain_production";
}

/* =========================================================
   SIGNAL REASONS
========================================================= */

export function buildSignalReasons(
  momentum:
    | number
    | null
    | undefined,
  eventOpportunity: number,
  seasonal:
    | {
        level: FuturePlannerSeasonalLevel;
        reason: string;
      }
    | null,
): string[] {
  const reasons: string[] = [];

  if (
    momentum !== null &&
    momentum !== undefined &&
    Number.isFinite(momentum)
  ) {
    if (momentum >= 8) {
      reasons.push(
        `Observed trade momentum is positive at approximately ${round(momentum, 1)}%.`,
      );
    } else if (momentum <= -8) {
      reasons.push(
        `Observed trade momentum is negative at approximately ${round(momentum, 1)}%.`,
      );
    } else {
      reasons.push(
        `Observed trade momentum is relatively stable at approximately ${round(momentum, 1)}%.`,
      );
    }
  } else {
    reasons.push(
      "Sufficient normalized trade observations were not available to calculate trade momentum.",
    );
  }

  if (
    eventOpportunity > 0
  ) {
    reasons.push(
      `Relevant Government market-event opportunity score is ${Math.round(eventOpportunity)}/100.`,
    );
  } else {
    reasons.push(
      "No craft-specific Government event signal was detected in the current planning window.",
    );
  }

  if (seasonal) {
    reasons.push(
      seasonal.reason,
    );
  }

  return reasons;
}

/* =========================================================
   COMPLETE MARKET SIGNAL
========================================================= */

export function calculateMarketSignal(
  events: GovernmentEvent[],
  eventKeywords: string[],
  categoryMomentum:
    | number
    | null = null,
  tradeObservations:
    | TradeObservation[]
    | null = null,
  odopRelevance = 0,
  now = new Date(),
): MarketSignal {
  /*
   * Prefer actual normalized trade observations
   * when supplied.
   */
  const calculatedTradeMomentum =
    tradeObservations &&
    tradeObservations.length >= 2
      ? calculateTradeMomentum(
          tradeObservations,
        )
      : null;

  /*
   * Explicit category momentum can be used
   * as an additional normalized signal.
   */
  const normalizedCategoryMomentum =
    normalizeCategoryMomentum(
      categoryMomentum,
    );

  /*
   * If trade observations exist, use them.
   * Otherwise fall back to the supplied category
   * momentum.
   */
  const tradeMomentum =
    calculatedTradeMomentum ??
    normalizedCategoryMomentum;

  const eventOpportunity =
    calculateEventOpportunity(
      events,
      eventKeywords,
      DEFAULT_EVENT_WINDOW_MONTHS,
      now,
    );

  const seasonal =
    calculateSeasonalOpportunity(
      events,
      eventKeywords,
      DEFAULT_EVENT_WINDOW_MONTHS,
      now,
    );

  const demandTrend =
    getDemandTrend(
      tradeMomentum,
    );

  const reasons =
    buildSignalReasons(
      tradeMomentum,
      eventOpportunity,
      seasonal,
    );

  return {
    tradeMomentum,

    categoryMomentum:
      normalizedCategoryMomentum,

    eventOpportunity,

    odopRelevance:
      clamp(
        odopRelevance,
      ),

    demandTrend,

    seasonalLevel:
      seasonal.level,

    reasons,
  };
}