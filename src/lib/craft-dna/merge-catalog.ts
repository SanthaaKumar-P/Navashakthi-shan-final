/* =========================================================
   NAVSHAKTHI - CRAFT DNA CATALOG MERGER
   =========================================================

   Purpose:

   Smart Pricing
        ↓
   Image-derived Craft DNA
        ↓
   Smart Cataloger
        ↓
   Artisan voice / catalog facts
        ↓
   This module
        ↓
   Shared Craft DNA

   Rules:

   1. Never destroy stronger existing information.
   2. "Not provided" never replaces a known value.
   3. Catalog information is marked as "catalog" evidence.
   4. Existing image/manual evidence is preserved when
      the Cataloger does not provide a useful value.
   5. All Craft DNA attributes remain properly wrapped as:
         {
           value,
           confidence,
           source
         }
========================================================= */

import type {
  CraftDNA,
  CraftDNAAttribute,
  CraftDNAValueSource,
} from "@/lib/craft-dna/types";

/* =========================================================
   CONSTANTS
========================================================= */

const NOT_PROVIDED = "Not provided";

/* =========================================================
   GENERIC NORMALISERS
========================================================= */

function normalizeConfidence(value: unknown): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return 0;
  }

  /*
   * Catalog confidence may arrive as:
   *
   * 75    -> 0.75
   * 0.75  -> 0.75
   */
  if (numeric > 1) {
    return Math.min(1, Math.max(0, numeric / 100));
  }

  return Math.min(1, Math.max(0, numeric));
}

function cleanString(value: unknown): string {
  if (typeof value !== "string") {
    return NOT_PROVIDED;
  }

  const cleaned = value.trim();

  if (!cleaned) {
    return NOT_PROVIDED;
  }

  const normalized = cleaned.toLowerCase();

  /*
   * Treat common AI empty-value phrases as missing.
   */
  const invalidValues = [
    "not provided",
    "not available",
    "unknown",
    "n/a",
    "na",
    "none",
    "null",
    "undefined",
    "not specified",
    "not mentioned",
    "cannot determine",
    "cannot be determined",
    "needs artisan confirmation",
  ];

  if (invalidValues.includes(normalized)) {
    return NOT_PROVIDED;
  }

  return cleaned;
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === "string",
        )
        .map((item) => item.trim())
        .filter(Boolean)
        .filter(
          (item) =>
            item.toLowerCase() !==
            NOT_PROVIDED.toLowerCase(),
        ),
    ),
  );
}

function cleanNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(minimum, numeric),
  );
}

/* =========================================================
   ATTRIBUTE HELPER
========================================================= */

function makeAttribute<T>(
  value: T,
  confidence: number,
  source: CraftDNAValueSource,
): CraftDNAAttribute<T> {
  return {
    value,
    confidence: normalizeConfidence(confidence),
    source,
  };
}

/* =========================================================
   CATALOG DATA TYPE
========================================================= */

/**
 * This is intentionally independent from the
 * Smart Cataloger component.
 *
 * That means other modules can also reuse the
 * same Craft DNA merge engine.
 */
export interface CatalogDataForDNA {
  category?: string;

  productType?: string;

  material?: string;

  primaryColour?: string;

  secondaryColours?: string[];

  shape?: string;

  pattern?: string;

  texture?: string;

  finish?: string;

  decoration?: string;

  complexity?: number;

  size?: string;

  dimensions?: string;

  useCase?: string;

  visualCharacteristics?: string[];

  confidence?: number;
}

/* =========================================================
   CATALOG RESPONSE ADAPTER
========================================================= */

/**
 * Smart Cataloger currently returns product attributes
 * inside:
 *
 * catalog.product
 *
 * Example:
 *
 * {
 *   material: "Cotton",
 *   colour: "Red",
 *   pattern: "Floral"
 * }
 *
 * This adapter converts that flexible structure into the
 * stable CatalogDataForDNA structure.
 */

export interface CatalogLikeForDNA {
  product?: Record<string, unknown>;

  confidence?: number;
}

/**
 * Normalise arbitrary product keys.
 *
 * Example:
 *
 * "Primary Colour" -> "primarycolour"
 * "primary_color"  -> "primarycolor"
 */
function normalizeKey(
  key: string,
): string {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/* =========================================================
   PRODUCT VALUE LOOKUP
========================================================= */

function findProductValue(
  product: Record<string, unknown>,
  keys: string[],
): string {
  const normalizedCandidates =
    keys.map(normalizeKey);

  for (const [
    key,
    rawValue,
  ] of Object.entries(product)) {
    const normalizedKey =
      normalizeKey(key);

    const matches =
      normalizedCandidates.some(
        (candidate) =>
          normalizedKey === candidate ||
          normalizedKey.includes(candidate),
      );

    if (!matches) {
      continue;
    }

    const value = cleanString(rawValue);

    if (value !== NOT_PROVIDED) {
      return value;
    }
  }

  return NOT_PROVIDED;
}

/* =========================================================
   PRODUCT NUMBER LOOKUP
========================================================= */

function findProductNumber(
  product: Record<string, unknown>,
  keys: string[],
): number | undefined {
  const value =
    findProductValue(
      product,
      keys,
    );

  if (value === NOT_PROVIDED) {
    return undefined;
  }

  const match =
    value.match(
      /-?\d+(?:\.\d+)?/,
    );

  if (!match) {
    return undefined;
  }

  const numeric =
    Number(match[0]);

  return Number.isFinite(numeric)
    ? numeric
    : undefined;
}

/* =========================================================
   CATALOG -> DNA INPUT
========================================================= */

/**
 * Converts the Smart Cataloger's generated catalog
 * into the stable Craft DNA input format.
 *
 * This function is exported because Smart Cataloger
 * should NOT duplicate this mapping logic.
 */
export function catalogToDNAInput(
  catalog: CatalogLikeForDNA,
): CatalogDataForDNA {
  const product =
    catalog.product ?? {};

  const secondaryRaw =
    findProductValue(
      product,
      [
        "secondaryColours",
        "secondaryColors",
        "secondaryColour",
        "secondaryColor",
        "colours",
        "colors",
      ],
    );

  const secondaryColours =
    secondaryRaw === NOT_PROVIDED
      ? []
      : secondaryRaw
          .split(/[,;/|]+/)
          .map(
            (item) => item.trim(),
          )
          .filter(Boolean);

  return {
    category:
      findProductValue(
        product,
        [
          "category",
          "craftCategory",
          "craftType",
          "craft",
        ],
      ),

    productType:
      findProductValue(
        product,
        [
          "productType",
          "product",
          "type",
          "name",
        ],
      ),

    material:
      findProductValue(
        product,
        [
          "material",
          "madeOf",
          "materialUsed",
        ],
      ),

    primaryColour:
      findProductValue(
        product,
        [
          "primaryColour",
          "primaryColor",
          "colour",
          "color",
        ],
      ),

    secondaryColours,

    shape:
      findProductValue(
        product,
        [
          "shape",
          "form",
        ],
      ),

    pattern:
      findProductValue(
        product,
        [
          "pattern",
          "motif",
          "design",
        ],
      ),

    texture:
      findProductValue(
        product,
        [
          "texture",
          "surface",
        ],
      ),

    finish:
      findProductValue(
        product,
        [
          "finish",
          "finishing",
        ],
      ),

    decoration:
      findProductValue(
        product,
        [
          "decoration",
          "decorative",
          "embellishment",
        ],
      ),

    complexity:
      findProductNumber(
        product,
        [
          "complexity",
          "complexityScore",
          "detailLevel",
        ],
      ),

    size:
      findProductValue(
        product,
        [
          "sizeLabel",
          "size",
        ],
      ),

    dimensions:
      findProductValue(
        product,
        [
          "dimensions",
          "dimension",
          "measurements",
          "measurement",
        ],
      ),

    useCase:
      findProductValue(
        product,
        [
          "useCase",
          "usage",
          "purpose",
        ],
      ),

    visualCharacteristics:
      [],

    confidence:
      Number.isFinite(
        Number(catalog.confidence),
      )
        ? Number(catalog.confidence)
        : 70,
  };
}

/* =========================================================
   STRING MERGER
========================================================= */

function mergeString(
  incoming: unknown,
  current:
    | CraftDNAAttribute<string>
    | undefined
    | null,
  confidence: number,
): CraftDNAAttribute<string> {
  const incomingValue =
    cleanString(incoming);

  const hasIncoming =
    incomingValue !==
    NOT_PROVIDED;

  const currentValue =
    current?.value ??
    NOT_PROVIDED;

  const hasCurrent =
    cleanString(currentValue) !==
    NOT_PROVIDED;

  /*
   * Cataloger has no useful information.
   *
   * Preserve the existing DNA.
   */
  if (!hasIncoming && hasCurrent) {
    return {
      value: currentValue,
      confidence:
        normalizeConfidence(
          current?.confidence,
        ),
      source:
        current?.source ??
        "image",
    };
  }

  /*
   * Cataloger has a useful value.
   *
   * Use catalog evidence, but don't
   * lower an already stronger confidence.
   */
  if (hasIncoming) {
    return {
      value: incomingValue,
      confidence: Math.max(
        normalizeConfidence(
          confidence,
        ),
        normalizeConfidence(
          current?.confidence,
        ),
      ),
      source: "catalog",
    };
  }

  return {
    value: NOT_PROVIDED,
    confidence:
      normalizeConfidence(
        confidence,
      ),
    source: "catalog",
  };
}

/* =========================================================
   STRING ARRAY MERGER
========================================================= */

function mergeStringArray(
  incoming: unknown,
  current:
    | CraftDNAAttribute<string[]>
    | undefined
    | null,
  confidence: number,
): CraftDNAAttribute<string[]> {
  const incomingValues =
    cleanStringArray(
      incoming,
    );

  const currentValues =
    cleanStringArray(
      current?.value,
    );

  /*
   * Nothing incoming.
   * Preserve existing information.
   */
  if (
    incomingValues.length === 0 &&
    currentValues.length > 0
  ) {
    return {
      value: currentValues,
      confidence:
        normalizeConfidence(
          current?.confidence,
        ),
      source:
        current?.source ??
        "image",
    };
  }

  /*
   * Cataloger provided colours.
   */
  if (
    incomingValues.length > 0
  ) {
    return {
      value: incomingValues,
      confidence: Math.max(
        normalizeConfidence(
          confidence,
        ),
        normalizeConfidence(
          current?.confidence,
        ),
      ),
      source: "catalog",
    };
  }

  return {
    value: [],
    confidence:
      normalizeConfidence(
        confidence,
      ),
    source: "catalog",
  };
}

/* =========================================================
   NUMBER MERGER
========================================================= */

function mergeNumber(
  incoming: unknown,
  current:
    | CraftDNAAttribute<number>
    | undefined
    | null,
  minimum: number,
  maximum: number,
  confidence: number,
): CraftDNAAttribute<number> {
  const hasIncoming =
    typeof incoming ===
      "number" &&
    Number.isFinite(
      incoming,
    );

  /*
   * Preserve current numeric DNA if
   * Cataloger didn't provide one.
   */
  if (
    !hasIncoming &&
    current
  ) {
    return {
      value: cleanNumber(
        current.value,
        minimum,
        maximum,
      ),
      confidence:
        normalizeConfidence(
          current.confidence,
        ),
      source:
        current.source ??
        "image",
    };
  }

  const incomingNumber =
    cleanNumber(
      incoming,
      minimum,
      maximum,
    );

  return {
    value: incomingNumber,
    confidence: Math.max(
      normalizeConfidence(
        confidence,
      ),
      normalizeConfidence(
        current?.confidence,
      ),
    ),
    source: "catalog",
  };
}

/* =========================================================
   MAIN MERGER
========================================================= */

/**
 * Merge Smart Cataloger information into the
 * existing shared Craft DNA.
 *
 * IMPORTANT:
 *
 * Argument order is ALWAYS:
 *
 *   mergeCatalogIntoCraftDNA(
 *      catalog,
 *      currentDNA
 *   )
 *
 * Do not reverse the arguments.
 */
export function mergeCatalogIntoCraftDNA(
  catalog: CatalogDataForDNA,
  current:
    | CraftDNA
    | null
    | undefined,
): CraftDNA {
  const confidence =
    normalizeConfidence(
      catalog.confidence ??
        70,
    );

  const now =
    new Date().toISOString();

  const category =
    cleanString(
      catalog.category,
    );

  const productType =
    cleanString(
      catalog.productType,
    );

  const material =
    cleanString(
      catalog.material,
    );

  const primaryColour =
    cleanString(
      catalog.primaryColour,
    );

  const secondaryColours =
    cleanStringArray(
      catalog.secondaryColours,
    );

  const shape =
    cleanString(
      catalog.shape,
    );

  const pattern =
    cleanString(
      catalog.pattern,
    );

  const texture =
    cleanString(
      catalog.texture,
    );

  const finish =
    cleanString(
      catalog.finish,
    );

  const decoration =
    cleanString(
      catalog.decoration,
    );

  const size =
    cleanString(
      catalog.size,
    );

  const dimensions =
    cleanString(
      catalog.dimensions,
    );

  const useCase =
    cleanString(
      catalog.useCase,
    );

  const complexity =
    catalog.complexity;

  const existingVisualCharacteristics =
    current?.visualCharacteristics ??
    [];

  const incomingVisualCharacteristics =
    cleanStringArray(
      catalog.visualCharacteristics,
    );

  const visualCharacteristics =
    Array.from(
      new Set([
        ...existingVisualCharacteristics,
        ...incomingVisualCharacteristics,
      ]),
    );

  /*
   * If there is no existing DNA,
   * create a complete safe base object.
   */
  const merged: CraftDNA = {
    version: "1.0",

    craftCategory:
      mergeString(
        category,
        current?.craftCategory,
        confidence,
      ),

    productType:
      mergeString(
        productType,
        current?.productType,
        confidence,
      ),

    material:
      mergeString(
        material,
        current?.material,
        confidence,
      ),

    primaryColour:
      mergeString(
        primaryColour,
        current?.primaryColour,
        confidence,
      ),

    secondaryColours:
      mergeStringArray(
        secondaryColours,
        current?.secondaryColours,
        confidence,
      ),

    shape:
      mergeString(
        shape,
        current?.shape,
        confidence,
      ),

    pattern:
      mergeString(
        pattern,
        current?.pattern,
        confidence,
      ),

    texture:
      mergeString(
        texture,
        current?.texture,
        confidence,
      ),

    finish:
      mergeString(
        finish,
        current?.finish,
        confidence,
      ),

    decoration:
      mergeString(
        decoration,
        current?.decoration,
        confidence,
      ),

    complexity:
      mergeNumber(
        complexity,
        current?.complexity,
        1,
        10,
        confidence,
      ),

    size:
      mergeString(
        size,
        current?.size,
        confidence,
      ),

    dimensions:
      mergeString(
        dimensions,
        current?.dimensions,
        confidence,
      ),

    useCase:
      mergeString(
        useCase,
        current?.useCase,
        confidence,
      ),

    visualCharacteristics,

    /*
     * Keep the strongest overall confidence.
     */
    overallConfidence:
      Math.max(
        current?.overallConfidence ??
          0,
        confidence,
      ),

    createdAt:
      current?.createdAt ??
      now,

    updatedAt: now,
  };

  return merged;
}

/* =========================================================
   CREATE DNA FROM CATALOG
========================================================= */

export function createCraftDNAFromCatalog(
  catalog: CatalogDataForDNA,
): CraftDNA {
  return mergeCatalogIntoCraftDNA(
    catalog,
    null,
  );
}

/* =========================================================
   READ PLAIN DNA VALUES
========================================================= */

function getAttributeValue<T>(
  attribute:
    | CraftDNAAttribute<T>
    | undefined
    | null,
  fallback: T,
): T {
  if (
    attribute &&
    attribute.value !==
      undefined &&
    attribute.value !==
      null
  ) {
    return attribute.value;
  }

  return fallback;
}

/**
 * Converts Craft DNA back into plain values.
 *
 * Useful for UI, review screens and editors.
 */
export function getPlainCraftDNAValues(
  dna: CraftDNA,
): CatalogDataForDNA {
  return {
    category:
      getAttributeValue(
        dna.craftCategory,
        NOT_PROVIDED,
      ),

    productType:
      getAttributeValue(
        dna.productType,
        NOT_PROVIDED,
      ),

    material:
      getAttributeValue(
        dna.material,
        NOT_PROVIDED,
      ),

    primaryColour:
      getAttributeValue(
        dna.primaryColour,
        NOT_PROVIDED,
      ),

    secondaryColours:
      getAttributeValue(
        dna.secondaryColours,
        [],
      ),

    shape:
      getAttributeValue(
        dna.shape,
        NOT_PROVIDED,
      ),

    pattern:
      getAttributeValue(
        dna.pattern,
        NOT_PROVIDED,
      ),

    texture:
      getAttributeValue(
        dna.texture,
        NOT_PROVIDED,
      ),

    finish:
      getAttributeValue(
        dna.finish,
        NOT_PROVIDED,
      ),

    decoration:
      getAttributeValue(
        dna.decoration,
        NOT_PROVIDED,
      ),

    complexity:
      getAttributeValue(
        dna.complexity,
        1,
      ),

    size:
      getAttributeValue(
        dna.size,
        NOT_PROVIDED,
      ),

    dimensions:
      getAttributeValue(
        dna.dimensions,
        NOT_PROVIDED,
      ),

    useCase:
      getAttributeValue(
        dna.useCase,
        NOT_PROVIDED,
      ),

    visualCharacteristics:
      dna.visualCharacteristics ??
      [],

    confidence:
      Math.round(
        normalizeConfidence(
          dna.overallConfidence,
        ) * 100,
      ),
  };
}