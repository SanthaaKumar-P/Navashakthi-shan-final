/* =========================================================
   NAVSHAKTHI FUTURE PLANNER
   Government Data Layer
   ========================================================= */

import type {
  GovernmentEvent,
  GovernmentSourceSnapshot,
} from "./types";

/* =========================================================
   OFFICIAL GOVERNMENT SOURCES
========================================================= */

export const HANDICRAFT_EVENTS_URL =
  "https://indian.handicrafts.gov.in/en/events";

export const TRADESTAT_URL =
  "https://tradestat.commerce.gov.in/ftspcc/export_commodity_xcountry_wise_monthly";

export const ODOP_URL =
  "https://data.gov.in/catalog/one-district-one-product";

/* =========================================================
   SOURCE IDS
========================================================= */

export const GOVERNMENT_SOURCE_IDS = {
  TRADESTAT: "tradestat",
  ODOP: "odop",
  HANDICRAFT_EVENTS: "dc-handicrafts-events",
} as const;

/* =========================================================
   SOURCE REGISTRY
========================================================= */

export function getGovernmentSourceRegistry(
  observedAt = new Date().toISOString(),
): GovernmentSourceSnapshot[] {
  return [
    {
      sourceId: GOVERNMENT_SOURCE_IDS.TRADESTAT,

      name: "TRADESTAT — Ministry of Commerce and Industry",

      url: TRADESTAT_URL,

      type: "government",

      observedAt,

      status: "available",

      note:
        "Official Government trade-statistics source used as the evidence layer for commodity and export signals. NAVSHAKTHI does not treat this source as a future-price forecast.",
    },

    {
      sourceId: GOVERNMENT_SOURCE_IDS.ODOP,

      name: "One District One Product — Open Government Data",

      url: ODOP_URL,

      type: "government",

      observedAt,

      status: "available",

      note:
        "Official Open Government Data source used to identify district/product relationships and regional craft relevance.",
    },

    {
      sourceId: GOVERNMENT_SOURCE_IDS.HANDICRAFT_EVENTS,

      name:
        "Development Commissioner (Handicrafts) — Events",

      url: HANDICRAFT_EVENTS_URL,

      type: "government",

      observedAt,

      status: "available",

      note:
        "Official handicrafts events calendar used as a market-opportunity and seasonality signal.",
    },
  ];
}

/* =========================================================
   TEXT HELPERS
========================================================= */

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    )
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value: string): string {
  return decodeHtml(
    value.replace(/<[^>]*>/g, " "),
  ).trim();
}

function normalizeDate(value: string): string {
  const cleaned = value
    .replace(/\./g, "/")
    .replace(/-/g, "/")
    .trim();

  const match = cleaned.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
  );

  if (!match) {
    return "";
  }

  const [, day, month, year] = match;

  return `${year}-${month.padStart(
    2,
    "0",
  )}-${day.padStart(2, "0")}`;
}

function parseDateFromText(
  value: string,
): string {
  const cleaned = value.trim();

  /* DD/MM/YYYY */
  const slash = cleaned.match(
    /\b(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})\b/,
  );

  if (slash) {
    return normalizeDate(slash[0]);
  }

  /* DD Month YYYY */
  const named = cleaned.match(
    /\b(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})\b/,
  );

  if (named) {
    const parsed = new Date(
      `${named[1]} ${named[2]} ${named[3]}`,
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  /* Month DD, YYYY */
  const reverseNamed = cleaned.match(
    /\b([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})\b/,
  );

  if (reverseNamed) {
    const parsed = new Date(
      `${reverseNamed[1]} ${reverseNamed[2]}, ${reverseNamed[3]}`,
    );

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10);
    }
  }

  return "";
}

/* =========================================================
   TABLE CELL EXTRACTION
========================================================= */

function extractTableRows(
  html: string,
): string[][] {
  const rows: string[][] = [];

  const rowMatches = html.match(
    /<tr\b[^>]*>[\s\S]*?<\/tr>/gi,
  );

  if (!rowMatches) {
    return rows;
  }

  for (const row of rowMatches) {
    const cells =
      row.match(
        /<t[dh]\b[^>]*>[\s\S]*?<\/t[dh]>/gi,
      ) ?? [];

    const values = cells
      .map(stripHtml)
      .map((value) =>
        value
          .replace(/\s+/g, " ")
          .trim(),
      )
      .filter(Boolean);

    if (values.length > 0) {
      rows.push(values);
    }
  }

  return rows;
}

/* =========================================================
   DATE RANGE EXTRACTION
========================================================= */

function extractDateRange(
  text: string,
): {
  startDate: string;
  endDate: string;
} {
  const dates = [
    ...text.matchAll(
      /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{4}\b/g,
    ),
  ].map((match) =>
    parseDateFromText(match[0]),
  );

  if (dates.length >= 2) {
    return {
      startDate: dates[0],
      endDate: dates[1],
    };
  }

  const namedDates = [
    ...text.matchAll(
      /\b\d{1,2}\s+[A-Za-z]+\s+\d{4}\b/g,
    ),
  ].map((match) =>
    parseDateFromText(match[0]),
  );

  if (namedDates.length >= 2) {
    return {
      startDate: namedDates[0],
      endDate: namedDates[1],
    };
  }

  return {
    startDate: "",
    endDate: "",
  };
}

/* =========================================================
   APPLY/CLOSING DATE EXTRACTION
========================================================= */

function extractClosingDate(
  text: string,
): string | null {
  const closingPatterns = [
    /apply[^0-9]{0,50}(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i,

    /last\s+date[^0-9]{0,50}(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i,

    /closing[^0-9]{0,50}(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})/i,
  ];

  for (const pattern of closingPatterns) {
    const match = text.match(pattern);

    if (match?.[1]) {
      const parsed = parseDateFromText(match[1]);

      if (parsed) {
        return parsed;
      }
    }
  }

  return null;
}

/* =========================================================
   EVENT TYPE
========================================================= */

function inferEventType(
  title: string,
  text: string,
): string {
  const haystack =
    `${title} ${text}`.toLowerCase();

  if (haystack.includes("bazar")) {
    return "Shilp Bazar";
  }

  if (haystack.includes("exhibition")) {
    return "Exhibition";
  }

  if (haystack.includes("fair")) {
    return "Fair";
  }

  if (haystack.includes("master creation")) {
    return "Master Creation";
  }

  if (haystack.includes("festival")) {
    return "Festival";
  }

  if (haystack.includes("market")) {
    return "Market Event";
  }

  return "Handicraft Event";
}

/* =========================================================
   EVENT RELEVANCE KEYWORDS
========================================================= */

const GENERIC_EVENT_TERMS = [
  "handicraft",
  "craft",
  "artisan",
  "shilp",
  "bazar",
  "exhibition",
  "fair",
  "market",
  "master creation",
];

/* =========================================================
   PARSE GOVERNMENT EVENT TABLE
========================================================= */

function parseEventRows(
  rows: string[][],
): GovernmentEvent[] {
  const events: GovernmentEvent[] = [];

  for (const row of rows) {
    const rowText = row.join(" | ");

    if (
      !GENERIC_EVENT_TERMS.some((term) =>
        rowText
          .toLowerCase()
          .includes(term),
      )
    ) {
      continue;
    }

    const title =
      row.find(
        (cell) =>
          cell.length >= 5 &&
          !parseDateFromText(cell),
      ) ??
      row[0] ??
      "Government Handicraft Event";

    const {
      startDate,
      endDate,
    } = extractDateRange(rowText);

    /*
     * Ignore rows that don't contain
     * usable dates. This prevents navigation,
     * headers and unrelated page content from
     * becoming fake events.
     */
    if (!startDate || !endDate) {
      continue;
    }

    const applyClosingDate =
      extractClosingDate(rowText);

    events.push({
      title: title.trim(),

      type: inferEventType(
        title,
        rowText,
      ),

      startDate,

      endDate,

      applyClosingDate,

      sourceUrl:
        HANDICRAFT_EVENTS_URL,
    });
  }

  return events;
}

/* =========================================================
   DEDUPLICATE EVENTS
========================================================= */

function deduplicateEvents(
  events: GovernmentEvent[],
): GovernmentEvent[] {
  const seen = new Set<string>();

  const result: GovernmentEvent[] = [];

  for (const event of events) {
    const key = [
      event.title
        .toLowerCase()
        .trim(),

      event.startDate,

      event.endDate,
    ].join("|");

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push(event);
  }

  return result;
}

/* =========================================================
   FETCH HANDICRAFT EVENTS
========================================================= */

export async function fetchGovernmentHandicraftEvents(): Promise<{
  events: GovernmentEvent[];

  source: GovernmentSourceSnapshot;
}> {
  const observedAt =
    new Date().toISOString();

  const source: GovernmentSourceSnapshot = {
    sourceId:
      GOVERNMENT_SOURCE_IDS.HANDICRAFT_EVENTS,

    name:
      "Development Commissioner (Handicrafts) — Events",

    url:
      HANDICRAFT_EVENTS_URL,

    type: "government",

    observedAt,

    status: "available",

    note:
      "Events parsed from the official Development Commissioner (Handicrafts) events page.",
  };

  try {
    const response = await fetch(
      HANDICRAFT_EVENTS_URL,
      {
        method: "GET",

        headers: {
          Accept:
            "text/html,application/xhtml+xml",

          "User-Agent":
            "NAVSHAKTHI-Future-Planner/1.0",
        },

        cache: "no-store",
      },
    );

    if (!response.ok) {
      return {
        events: [],

        source: {
          ...source,

          status: "unavailable",

          note:
            `Official handicraft events source returned HTTP ${response.status}.`,
        },
      };
    }

    const html =
      await response.text();

    const rows =
      extractTableRows(html);

    const parsed =
      parseEventRows(rows);

    const events =
      deduplicateEvents(parsed);

    return {
      events,

      source,
    };
  } catch (error) {
    console.error(
      "Failed to fetch Government handicraft events:",
      error,
    );

    return {
      events: [],

      source: {
        ...source,

        status: "unavailable",

        note:
          "The official handicraft events source could not be reached at runtime.",
      },
    };
  }
}

/* =========================================================
   EVENT WINDOW
========================================================= */

export function isEventWithinMonths(
  event: GovernmentEvent,
  months: number,
  from = new Date(),
): boolean {
  if (!event.startDate) {
    return false;
  }

  const start =
    new Date(event.startDate);

  if (Number.isNaN(start.getTime())) {
    return false;
  }

  const limit =
    new Date(from);

  limit.setMonth(
    limit.getMonth() + months,
  );

  return (
    start >= from &&
    start <= limit
  );
}

/* =========================================================
   FILTER FUTURE EVENTS
========================================================= */

export function getUpcomingGovernmentEvents(
  events: GovernmentEvent[],
  months = 6,
  from = new Date(),
): GovernmentEvent[] {
  return events
    .filter((event) =>
      isEventWithinMonths(
        event,
        months,
        from,
      ),
    )
    .sort(
      (a, b) =>
        a.startDate.localeCompare(
          b.startDate,
        ),
    );
}

/* =========================================================
   KEYWORD MATCH
========================================================= */

export function eventMatchesKeywords(
  event: GovernmentEvent,
  keywords: string[],
): boolean {
  const haystack =
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

    return haystack.includes(clean);
  });
}

/* =========================================================
   FILTER RELEVANT EVENTS
========================================================= */

export function findRelevantGovernmentEvents(
  events: GovernmentEvent[],
  keywords: string[],
  months = 6,
): GovernmentEvent[] {
  const upcoming =
    getUpcomingGovernmentEvents(
      events,
      months,
    );

  const relevant =
    upcoming.filter((event) =>
      eventMatchesKeywords(
        event,
        keywords,
      ),
    );

  /*
   * If the source has a generic handicraft
   * event with no craft-specific keyword,
   * don't silently treat it as category-specific.
   *
   * The caller can separately use generic
   * events as broad opportunity signals.
   */
  return relevant;
}

/* =========================================================
   GOVERNMENT DATA HEALTH
========================================================= */

export function getGovernmentDataQuality(
  sources: GovernmentSourceSnapshot[],
): "high" | "medium" | "limited" {
  if (!sources.length) {
    return "limited";
  }

  const liveCount =
    sources.filter(
      (source) =>
        source.status === "live",
    ).length;

  const availableCount =
    sources.filter(
      (source) =>
        source.status === "available",
    ).length;

  if (
    liveCount >= 2 ||
    availableCount >= 2
  ) {
    return "high";
  }

  if (
    liveCount >= 1 ||
    availableCount >= 1
  ) {
    return "medium";
  }

  return "limited";
}

/* =========================================================
   SAFE TRADESTAT STATUS
========================================================= */

/**
 * TRADESTAT is intentionally represented as
 * an official source registry entry here.
 *
 * We do NOT fabricate export values.
 *
 * A dedicated TRADESTAT adapter can later normalize
 * an officially obtained response into TradeObservation[]
 * without changing the Future Planner architecture.
 */
export function getTradeStatSourceSnapshot(
  observedAt = new Date().toISOString(),
): GovernmentSourceSnapshot {
  return {
    sourceId:
      GOVERNMENT_SOURCE_IDS.TRADESTAT,

    name:
      "TRADESTAT — Ministry of Commerce and Industry",

    url:
      TRADESTAT_URL,

    type: "government",

    observedAt,

    status: "available",

    note:
      "Official TRADESTAT source registered for trade/export evidence. No synthetic trade values are generated when a machine-readable observation is unavailable.",
  };
}

/* =========================================================
   SAFE ODOP STATUS
========================================================= */

/**
 * ODOP is also kept as a separately replaceable
 * source adapter.
 *
 * This avoids coupling the planner to one
 * response format from data.gov.in.
 */
export function getOdopSourceSnapshot(
  observedAt = new Date().toISOString(),
): GovernmentSourceSnapshot {
  return {
    sourceId:
      GOVERNMENT_SOURCE_IDS.ODOP,

    name:
      "One District One Product — Open Government Data",

    url:
      ODOP_URL,

    type: "government",

    observedAt,

    status: "available",

    note:
      "Official data.gov.in ODOP catalogue registered for district/product relevance mapping.",
  };
}

/* =========================================================
   ALL GOVERNMENT SOURCES
========================================================= */

export function getAllGovernmentSources(
  observedAt = new Date().toISOString(),
): GovernmentSourceSnapshot[] {
  return getGovernmentSourceRegistry(
    observedAt,
  );
}