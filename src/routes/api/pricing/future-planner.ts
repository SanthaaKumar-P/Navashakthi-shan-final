import { createFileRoute } from "@tanstack/react-router";

/*
 * NAVSHAKTHI — Future Planner
 *
 * Purpose:
 * Convert current craft pricing evidence + government event signals
 * into a bounded 3-month / 6-month production-planning outlook.
 *
 * IMPORTANT:
 * - This is decision support, not a guaranteed future-price prediction.
 * - We never convert demand % directly into the same % price growth.
 * - Existing Smart Pricing market evidence is fetched from the existing
 *   /api/pricing/market endpoint.
 * - Government event information is sourced from the official
 *   Development Commissioner (Handicrafts) events page when available.
 */

/* =========================================================
   TYPES
========================================================= */

type MarketSourceType =
  | "curated_reference"
  | "official_reference";

interface MarketData {
  low: number;
  median: number;
  high: number;
  demandChange: number;
  comparableCount: number;
  matchLabel: string;
  sourceType: MarketSourceType;
  sourceLabel: string;
  updatedAt: string;
  materialCostReference: number;
  labourBenchmark: number;
}

interface GovernmentEvent {
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  relevance: number;
  source: string;
}

interface PlannerRequest {
  category?: unknown;
  productType?: unknown;
  material?: unknown;
  currentLow?: unknown;
  currentHigh?: unknown;
  complexity?: unknown;
}

interface Outlook {
  low: number;
  central: number;
  high: number;
  changePercent: number;
}

interface ForecastPoint {
  month: string;
  demandScore: number;
  seasonalityIndex: number;
}

interface PlannerResult {
  currentReference: number;
  currentLow: number;
  currentHigh: number;

  threeMonth: Outlook;
  sixMonth: Outlook;

  demandDirection:
    | "increasing"
    | "stable"
    | "decreasing"
    | "insufficient_data";

  demandChange: number | null;
  comparableCount: number;

  seasonalityLevel:
    | "low"
    | "moderate"
    | "high";

  opportunityScore: number;

  opportunityLevel:
    | "low"
    | "moderate"
    | "high";

  productionRecommendation: string;

  forecast: ForecastPoint[];

  governmentEvents: GovernmentEvent[];

  sources: Array<{
    label: string;
    url: string;
    type: "official" | "curated_reference" | "calculation";
    updatedAt?: string;
  }>;

  dataQuality: {
    marketReferenceAvailable: boolean;
    governmentEventsAvailable: boolean;
    tradeDataAvailable: boolean;
    odopDataAvailable: boolean;
    notes: string[];
  };
}

/* =========================================================
   CONSTANTS
========================================================= */

const HANDICRAFT_EVENTS_URL =
  "https://indian.handicrafts.gov.in/en/events";

const TRADESTAT_URL =
  "https://tradestat.commerce.gov.in/ftspcc/export_commodity_xcountry_wise_monthly";

const ODOP_URL =
  "https://data.gov.in/catalog/one-district-one-product";

/* =========================================================
   HELPERS
========================================================= */

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function asNumber(
  value: unknown,
  fallback = 0,
): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    Math.max(value, min),
    max,
  );
}

function roundRupee(value: number): number {
  return Math.max(
    1,
    Math.round(value / 5) * 5,
  );
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    },
  );
}

function addMonths(
  source: Date,
  months: number,
): Date {
  const date = new Date(source);
  date.setMonth(
    date.getMonth() + months,
  );
  return date;
}

function normalizeText(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* =========================================================
   DEMAND SIGNAL
========================================================= */

function calculateDemandSignal(
  demandChange: number | null,
  comparableCount: number,
) {
  if (
    demandChange === null ||
    comparableCount <= 0
  ) {
    return {
      direction:
        "insufficient_data" as const,
      score: 0,
      confidence: 0,
    };
  }

  /*
   * Demand change is an observed market-reference signal.
   *
   * It is NOT treated as direct price growth.
   */
  const boundedDemand =
    clamp(
      demandChange,
      -30,
      30,
    );

  let direction:
    | "increasing"
    | "stable"
    | "decreasing";

  if (boundedDemand >= 3) {
    direction = "increasing";
  } else if (boundedDemand <= -3) {
    direction = "decreasing";
  } else {
    direction = "stable";
  }

  /*
   * Convert the observed demand signal into a bounded
   * opportunity-support score.
   *
   * +30 demand => 100
   *  0 demand => 50
   * -30 demand => 0
   */
  const demandScore = clamp(
    Math.round(
      50 +
        boundedDemand *
          (50 / 30),
    ),
    0,
    100,
  );

  const confidence = clamp(
    Math.round(
      55 +
        Math.min(
          comparableCount,
          35,
        ),
    ),
    55,
    90,
  );

  return {
    direction,
    score: demandScore,
    confidence,
  };
}

/* =========================================================
   SEASONALITY
========================================================= */

function calculateSeasonalityLevel(
  events: GovernmentEvent[],
): "low" | "moderate" | "high" {
  if (events.length >= 3) {
    return "high";
  }

  if (events.length >= 1) {
    return "moderate";
  }

  return "moderate";
}

/* =========================================================
   EVENT RELEVANCE
========================================================= */

function categoryKeywords(
  category: string,
): string[] {
  const normalized =
    normalizeText(category);

  if (normalized.includes("pottery")) {
    return [
      "pottery",
      "terracotta",
      "ceramic",
      "clay",
      "handicraft",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (
    normalized.includes("handloom") ||
    normalized.includes("textile")
  ) {
    return [
      "handloom",
      "textile",
      "weaving",
      "silk",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (normalized.includes("wood")) {
    return [
      "wood",
      "wooden",
      "carving",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (normalized.includes("metal")) {
    return [
      "metal",
      "brass",
      "bronze",
      "dhokra",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (
    normalized.includes("jewelry") ||
    normalized.includes("jewellery")
  ) {
    return [
      "jewellery",
      "jewelry",
      "ornament",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (
    normalized.includes("bamboo") ||
    normalized.includes("cane")
  ) {
    return [
      "bamboo",
      "cane",
      "rattan",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (
    normalized.includes("stone") ||
    normalized.includes("sculpture")
  ) {
    return [
      "stone",
      "sculpture",
      "carving",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  if (
    normalized.includes("instrument")
  ) {
    return [
      "instrument",
      "music",
      "craft",
      "mela",
      "dilli haat",
    ];
  }

  return [
    "handicraft",
    "craft",
    "mela",
    "dilli haat",
  ];
}

function calculateEventRelevance(
  event: GovernmentEvent,
  category: string,
  productType: string,
  material: string,
): number {
  const text = normalizeText(
    `${event.title} ${event.location}`,
  );

  const keywords = [
    ...categoryKeywords(category),
    ...normalizeText(
      productType,
    )
      .split(" ")
      .filter(
        (token) => token.length > 3,
      ),
    ...normalizeText(
      material,
    )
      .split(" ")
      .filter(
        (token) => token.length > 3,
      ),
  ];

  let matches = 0;

  for (const keyword of keywords) {
    if (
      keyword &&
      text.includes(
        normalizeText(keyword),
      )
    ) {
      matches += 1;
    }
  }

  /*
   * Government handicraft events are inherently relevant
   * to handicraft production even when category-specific
   * wording is not present.
   */
  const baseScore = 35;

  return clamp(
    Math.round(
      baseScore +
        Math.min(
          matches * 12,
          55,
        ),
    ),
    0,
    100,
  );
}

/* =========================================================
   DATE PARSING
========================================================= */

function parseDate(
  value: string,
): Date | null {
  const cleaned =
    value.trim();

  if (!cleaned) {
    return null;
  }

  const match =
    cleaned.match(
      /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/,
    );

  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(
      year,
      month - 1,
      day,
    );

    if (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    ) {
      return date;
    }
  }

  const yearMonth =
    cleaned.match(
      /(\d{4})-(\d{2})-(\d{2})/,
    );

  if (yearMonth) {
    const date = new Date(
      Number(yearMonth[1]),
      Number(yearMonth[2]) - 1,
      Number(yearMonth[3]),
    );

    return Number.isNaN(
      date.getTime(),
    )
      ? null
      : date;
  }

  return null;
}

/* =========================================================
   GOVERNMENT EVENT PARSER
========================================================= */

function parseGovernmentEvents(
  html: string,
): GovernmentEvent[] {
  const events: GovernmentEvent[] = [];

  /*
   * The government events page is HTML rather than a stable
   * public JSON endpoint. We therefore use a conservative
   * text parser and only keep rows containing recognisable
   * date ranges.
   */

  const plainText = html
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      " ",
    )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      " ",
    )
    .replace(
      /<[^>]+>/g,
      " ",
    )
    .replace(
      /&nbsp;/gi,
      " ",
    )
    .replace(
      /&amp;/gi,
      "&",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();

  const datePattern =
    /(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})\s*(?:-|to|–|—)\s*(\d{1,2}[\/.-]\d{1,2}[\/.-]\d{4})/gi;

  let match: RegExpExecArray | null;

  while (
    (match =
      datePattern.exec(
        plainText,
      )) !== null
  ) {
    const start =
      parseDate(match[1]);

    const end =
      parseDate(match[2]);

    if (!start || !end) {
      continue;
    }

    const before =
      plainText.slice(
        Math.max(
          0,
          match.index - 220,
        ),
        match.index,
      );

    const title =
      before
        .split(/[.;|]/)
        .pop()
        ?.trim()
        .replace(
          /\s+/g,
          " ",
        ) ?? "Handicraft event";

    if (
      title.length < 4 ||
      title.length > 180
    ) {
      continue;
    }

    events.push({
      title,
      startDate:
        start
          .toISOString()
          .slice(0, 10),
      endDate:
        end
          .toISOString()
          .slice(0, 10),
      location:
        title,
      relevance: 35,
      source:
        HANDICRAFT_EVENTS_URL,
    });

    if (events.length >= 30) {
      break;
    }
  }

  /*
   * De-duplicate.
   */
  const unique = new Map<
    string,
    GovernmentEvent
  >();

  for (const event of events) {
    const key =
      `${event.title}|${event.startDate}|${event.endDate}`;

    if (!unique.has(key)) {
      unique.set(
        key,
        event,
      );
    }
  }

  return Array.from(
    unique.values(),
  );
}

/* =========================================================
   FETCH GOVERNMENT EVENTS
========================================================= */

async function fetchGovernmentEvents(
  category: string,
  productType: string,
  material: string,
): Promise<GovernmentEvent[]> {
  try {
    const response =
      await fetch(
        HANDICRAFT_EVENTS_URL,
        {
          headers: {
            Accept:
              "text/html,application/xhtml+xml",
            "User-Agent":
              "NAVSHAKTHI-Future-Planner/1.0",
          },
        },
      );

    if (!response.ok) {
      console.warn(
        "NAVSHAKTHI: Government events request failed:",
        response.status,
      );

      return [];
    }

    const html =
      await response.text();

    const parsed =
      parseGovernmentEvents(
        html,
      );

    const now =
      new Date();

    const horizon =
      addMonths(
        now,
        6,
      );

    return parsed
      .map(
        (event) => ({
          ...event,
          relevance:
            calculateEventRelevance(
              event,
              category,
              productType,
              material,
            ),
        }),
      )
      .filter(
        (event) => {
          const start =
            parseDate(
              event.startDate,
            );

          if (!start) {
            return false;
          }

          return (
            start >= now &&
            start <= horizon
          );
        },
      )
      .sort(
        (a, b) =>
          b.relevance -
          a.relevance,
      )
      .slice(0, 8);
  } catch (error) {
    console.warn(
      "NAVSHAKTHI: Government events unavailable:",
      error,
    );

    return [];
  }
}

/* =========================================================
   MARKET DATA
========================================================= */

async function fetchMatchedMarket(
  request: Request,
  category: string,
  productType: string,
  material: string,
  complexity: number,
): Promise<MarketData | null> {
  try {
    const requestUrl =
      new URL(
        request.url,
      );

    const marketUrl =
      new URL(
        "/api/pricing/market",
        requestUrl.origin,
      );

    marketUrl.searchParams.set(
      "category",
      category,
    );

    marketUrl.searchParams.set(
      "productType",
      productType,
    );

    marketUrl.searchParams.set(
      "material",
      material,
    );

    marketUrl.searchParams.set(
      "sizeLabel",
      "Standard",
    );

    marketUrl.searchParams.set(
      "complexity",
      String(
        clamp(
          complexity,
          1,
          10,
        ),
      ),
    );

    const response =
      await fetch(
        marketUrl,
        {
          headers: {
            Accept:
              "application/json",
          },
        },
      );

    if (!response.ok) {
      console.warn(
        "NAVSHAKTHI: Market endpoint returned:",
        response.status,
      );

      return null;
    }

    const data =
      (await response.json()) as {
        success?: boolean;
        market?: MarketData;
      };

    if (
      !data.success ||
      !data.market
    ) {
      return null;
    }

    return data.market;
  } catch (error) {
    console.warn(
      "NAVSHAKTHI: Could not fetch matched market:",
      error,
    );

    return null;
  }
}

/* =========================================================
   OUTLOOK CALCULATION
========================================================= */

function calculateOutlook(
  currentReference: number,
  currentLow: number,
  currentHigh: number,
  demandChange: number | null,
  opportunityScore: number,
  months: 3 | 6,
): Outlook {
  /*
   * Demand influence is deliberately small.
   *
   * Example:
   * +9% demand does NOT become +9% price.
   *
   * Maximum demand contribution:
   * roughly ±6% for 3 months
   * roughly ±9% for 6 months
   */
  const boundedDemand =
    clamp(
      demandChange ?? 0,
      -20,
      20,
    );

  const demandWeight =
    months === 3
      ? 0.30
      : 0.45;

  const demandFactor =
    1 +
    (boundedDemand / 100) *
      demandWeight;

  /*
   * Opportunity contribution is intentionally smaller.
   */
  const opportunityFactor =
    1 +
    ((opportunityScore - 50) /
      100) *
      (months === 3
        ? 0.04
        : 0.06);

  const factor =
    clamp(
      demandFactor *
        opportunityFactor,
      months === 3
        ? 0.94
        : 0.90,
      months === 3
        ? 1.08
        : 1.12,
    );

  const central =
    roundRupee(
      currentReference *
        factor,
    );

  const spread =
    months === 3
      ? 0.06
      : 0.09;

  const low =
    roundRupee(
      Math.min(
        central,
        Math.max(
          currentLow,
          central *
            (1 - spread),
        ),
      ),
    );

  const high =
    roundRupee(
      Math.max(
        central,
        Math.min(
          currentHigh *
            1.10,
          central *
            (1 + spread),
        ),
      ),
    );

  const changePercent =
    currentReference > 0
      ? Math.round(
          ((central -
            currentReference) /
            currentReference) *
            100,
        )
      : 0;

  return {
    low,
    central,
    high,
    changePercent,
  };
}

/* =========================================================
   OPPORTUNITY SCORE
========================================================= */

function calculateOpportunityScore(
  demandScore: number,
  demandConfidence: number,
  events: GovernmentEvent[],
): number {
  const eventScore =
    events.length === 0
      ? 0
      : clamp(
          Math.round(
            events.reduce(
              (sum, event) =>
                sum +
                event.relevance,
              0,
            ) /
              events.length,
          ),
          0,
          100,
        );

  /*
   * Demand gets more weight than event count.
   */
  const score =
    demandConfidence > 0
      ? demandScore * 0.65 +
        eventScore * 0.35
      : eventScore;

  return clamp(
    Math.round(score),
    0,
    100,
  );
}

/* =========================================================
   OPPORTUNITY LEVEL
========================================================= */

function opportunityLevel(
  score: number,
): "low" | "moderate" | "high" {
  if (score >= 70) {
    return "high";
  }

  if (score >= 45) {
    return "moderate";
  }

  return "low";
}

/* =========================================================
   PRODUCTION RECOMMENDATION
========================================================= */

function buildProductionRecommendation(
  category: string,
  productType: string,
  demandDirection:
    | "increasing"
    | "stable"
    | "decreasing"
    | "insufficient_data",
  opportunity:
    | "low"
    | "moderate"
    | "high",
  events: GovernmentEvent[],
): string {
  const craft =
    productType ||
    category ||
    "this craft";

  if (
    demandDirection ===
      "increasing" &&
    opportunity === "high"
  ) {
    return (
      `Prioritise producing ${craft} and closely related variants over the next production cycle. ` +
      `The current market signal is positive and relevant handicraft opportunities are available.`
    );
  }

  if (
    demandDirection ===
      "increasing"
  ) {
    return (
      `Consider increasing production of ${craft} gradually. ` +
      `Current observed demand is positive, but production should remain proportional to available evidence.`
    );
  }

  if (
    demandDirection ===
      "decreasing"
  ) {
    return (
      `Avoid over-producing ${craft}. ` +
      `Consider smaller batches, refreshed designs or differentiated variants until demand signals improve.`
    );
  }

  if (
    events.length > 0
  ) {
    return (
      `Maintain controlled production of ${craft} and prepare event-ready variants for upcoming handicraft market opportunities.`
    );
  }

  return (
    `Maintain a measured production batch for ${craft} and review new market signals before significantly increasing output.`
  );
}

/* =========================================================
   FORECAST SERIES
========================================================= */

function buildForecastSeries(
  currentReference: number,
  demandChange: number | null,
  opportunityScore: number,
  events: GovernmentEvent[],
): ForecastPoint[] {
  const now =
    new Date();

  const boundedDemand =
    clamp(
      demandChange ?? 0,
      -20,
      20,
    );

  const baseDemand =
    clamp(
      Math.round(
        50 +
          boundedDemand *
            (50 / 30),
      ),
      20,
      90,
    );

  const points: ForecastPoint[] = [];

  for (
    let index = 1;
    index <= 6;
    index += 1
  ) {
    const date =
      addMonths(
        now,
        index,
      );

    /*
     * Small bounded progression rather than a fake
     * deterministic market prediction.
     */
    const progression =
      (opportunityScore -
        50) *
      0.10 *
      index;

    const eventBoost =
      events.some(
        (event) => {
          const eventDate =
            parseDate(
              event.startDate,
            );

          if (!eventDate) {
            return false;
          }

          const monthDistance =
            (
              eventDate.getFullYear() -
                date.getFullYear()
            ) *
              12 +
            (
              eventDate.getMonth() -
              date.getMonth()
            );

          return (
            Math.abs(
              monthDistance,
            ) <= 1
          );
        },
      )
        ? 8
        : 0;

    const demandScore =
      clamp(
        Math.round(
          baseDemand +
            progression +
            eventBoost,
        ),
        0,
        100,
      );

    /*
     * Seasonality index intentionally remains a bounded
     * decision-support indicator.
     */
    const seasonalityIndex =
      clamp(
        Math.round(
          50 +
            Math.sin(
              (date.getMonth() /
                12) *
                Math.PI *
                2,
            ) *
              18 +
            eventBoost,
        ),
        20,
        90,
      );

    void currentReference;

    points.push({
      month:
        formatMonth(
          date,
        ),
      demandScore,
      seasonalityIndex,
    });
  }

  return points;
}

/* =========================================================
   ROUTE
========================================================= */

export const Route =
  createFileRoute(
    "/api/pricing/future-planner",
  )({
    server: {
      handlers: {
        POST: async ({
          request,
        }) => {
          try {
            /* -------------------------------------------------
               1. READ REQUEST
            ------------------------------------------------- */

            const body =
              (await request.json()) as PlannerRequest;

            const category =
              asString(
                body.category,
              );

            const productType =
              asString(
                body.productType,
              );

            const material =
              asString(
                body.material,
              );

            const currentLow =
              Math.max(
                1,
                asNumber(
                  body.currentLow,
                  0,
                ),
              );

            const currentHigh =
              Math.max(
                currentLow,
                asNumber(
                  body.currentHigh,
                  currentLow,
                ),
              );

            const complexity =
              clamp(
                asNumber(
                  body.complexity,
                  5,
                ),
                1,
                10,
              );

            if (!category) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Craft category is required.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              currentLow <= 0 ||
              currentHigh <= 0
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "A valid current price range is required.",
                },
                {
                  status: 400,
                },
              );
            }

            /* -------------------------------------------------
               2. CURRENT PRICE REFERENCE
            ------------------------------------------------- */

            const currentReference =
              roundRupee(
                (currentLow +
                  currentHigh) /
                  2,
              );

            /* -------------------------------------------------
               3. EXISTING MARKET ENGINE
            ------------------------------------------------- */

            const market =
              await fetchMatchedMarket(
                request,
                category,
                productType,
                material,
                complexity,
              );

            const demandChange =
              market &&
              Number.isFinite(
                market.demandChange,
              )
                ? market.demandChange
                : null;

            const comparableCount =
              market?.comparableCount ??
              0;

            const demand =
              calculateDemandSignal(
                demandChange,
                comparableCount,
              );

            /* -------------------------------------------------
               4. GOVERNMENT OPPORTUNITY SIGNALS
            ------------------------------------------------- */

            const governmentEvents =
              await fetchGovernmentEvents(
                category,
                productType,
                material,
              );

            const seasonalityLevel =
              calculateSeasonalityLevel(
                governmentEvents,
              );

            /* -------------------------------------------------
               5. OPPORTUNITY SCORE
            ------------------------------------------------- */

            const opportunityScore =
              calculateOpportunityScore(
                demand.score,
                demand.confidence,
                governmentEvents,
              );

            const level =
              opportunityLevel(
                opportunityScore,
              );

            /* -------------------------------------------------
               6. PRICE OUTLOOK
            ------------------------------------------------- */

            const threeMonth =
              calculateOutlook(
                currentReference,
                currentLow,
                currentHigh,
                demandChange,
                opportunityScore,
                3,
              );

            const sixMonth =
              calculateOutlook(
                currentReference,
                currentLow,
                currentHigh,
                demandChange,
                opportunityScore,
                6,
              );

            /* -------------------------------------------------
               7. PRODUCTION RECOMMENDATION
            ------------------------------------------------- */

            const productionRecommendation =
              buildProductionRecommendation(
                category,
                productType,
                demand.direction,
                level,
                governmentEvents,
              );

            /* -------------------------------------------------
               8. FORECAST SERIES
            ------------------------------------------------- */

            const forecast =
              buildForecastSeries(
                currentReference,
                demandChange,
                opportunityScore,
                governmentEvents,
              );

            /* -------------------------------------------------
               9. SOURCES
            ------------------------------------------------- */

            const sources:
              PlannerResult["sources"] =
              [
                {
                  label:
                    market?.sourceLabel ??
                    "NAVSHAKTHI market reference",
                  url:
                    market
                      ? "/api/pricing/market"
                      : "",
                  type:
                    market
                      ? market.sourceType ===
                        "official_reference"
                        ? "official"
                        : "curated_reference"
                      : "calculation",
                  updatedAt:
                    market?.updatedAt,
                },
                {
                  label:
                    "Development Commissioner (Handicrafts) — official events",
                  url:
                    HANDICRAFT_EVENTS_URL,
                  type: "official",
                  updatedAt:
                    new Date()
                      .toISOString()
                      .slice(
                        0,
                        10,
                      ),
                },
                {
                  label:
                    "TRADESTAT — Ministry of Commerce and Industry",
                  url:
                    TRADESTAT_URL,
                  type: "official",
                },
                {
                  label:
                    "One District One Product — Open Government Data",
                  url:
                    ODOP_URL,
                  type: "official",
                },
              ];

            /* -------------------------------------------------
               10. DATA QUALITY
            ------------------------------------------------- */

            const dataQuality =
              {
                marketReferenceAvailable:
                  Boolean(
                    market,
                  ),
                governmentEventsAvailable:
                  governmentEvents.length >
                  0,
                /*
                 * We intentionally do not fabricate trade
                 * observations when no normalized API data
                 * is available.
                 */
                tradeDataAvailable:
                  false,
                odopDataAvailable:
                  false,
                notes: [
                  market
                    ? "Existing Smart Pricing market evidence was reused."
                    : "Matched market reference was unavailable.",
                  governmentEvents.length >
                  0
                    ? "Official handicraft event signals were found."
                    : "No upcoming government event signal was available.",
                  "TRADESTAT observations are not fabricated when a normalized data feed is unavailable.",
                  "ODOP relevance is not fabricated without a verified district-product match.",
                  "Future values are bounded decision-support estimates, not guaranteed prices.",
                ],
              };

            /* -------------------------------------------------
               11. FINAL RESULT
            ------------------------------------------------- */

            const result: PlannerResult =
              {
                currentReference,
                currentLow,
                currentHigh,

                threeMonth,
                sixMonth,

                demandDirection:
                  demand.direction,

                demandChange,

                comparableCount,

                seasonalityLevel,

                opportunityScore,

                opportunityLevel:
                  level,

                productionRecommendation,

                forecast,

                governmentEvents,

                sources,

                dataQuality,
              };

            /* -------------------------------------------------
               12. RESPONSE
            ------------------------------------------------- */

            return Response.json({
              success: true,

              result,

              /*
               * Backward-compatible aliases for the current
               * Smart Pricing UI normalizer.
               */
              forecast: result,

              currentPrice:
                currentReference,

              currentLow,

              currentHigh,

              demandDirection:
                demand.direction,

              demandChange,

              comparableCount,

              opportunityScore,

              opportunityLevel:
                level,

              seasonalityLevel,

              productionRecommendation,

              governmentEvents,

              sources,

              dataQuality,

              threeMonth,

              sixMonth,
            });
          } catch (error) {
            console.error(
              "NAVSHAKTHI Future Planner failed:",
              error,
            );

            return Response.json(
              {
                success: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "Unable to generate the future planning outlook.",
              },
              {
                status: 500,
              },
            );
          }
        },
      },
    },
  });