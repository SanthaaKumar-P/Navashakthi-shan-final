import type { CraftCatalogDraft } from "@/lib/craft-draft";
import type { CraftDNA, CraftDNAAttribute } from "./types";

const UNKNOWN_VALUES = new Set([
  "",
  "not provided",
  "unknown",
  "n/a",
  "na",
  "needs artisan confirmation",
  "not specified",
  "not mentioned",
]);

function isUsefulValue(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  return !UNKNOWN_VALUES.has(value.trim().toLowerCase());
}

function clean(value: unknown): string | null {
  if (!isUsefulValue(value)) {
    return null;
  }

  return value.trim();
}

function confidenceFromCatalog(
  catalogConfidence: number,
): number {
  const normalized =
    catalogConfidence > 1
      ? catalogConfidence / 100
      : catalogConfidence;

  return Math.max(
    0,
    Math.min(1, normalized),
  );
}

function makeAttribute<T>(
  value: T,
  confidence: number,
  source: CraftDNAAttribute<T>["source"],
): CraftDNAAttribute<T> {
  return {
    value,
    confidence: Math.max(
      0,
      Math.min(1, confidence),
    ),
    source,
  };
}

function findProductValue(
  product: Record<string, string>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = clean(product[key]);

    if (value) {
      return value;
    }
  }

  return null;
}

function findArrayValue(
  product: Record<string, string>,
  keys: string[],
): string[] {
  for (const key of keys) {
    const value = clean(product[key]);

    if (!value) {
      continue;
    }

    const values = value
      .split(/[,;|]/)
      .map((item) => item.trim())
      .filter(Boolean);

    if (values.length > 0) {
      return values;
    }
  }

  return [];
}

function getCurrentAttributeConfidence(
  attribute: CraftDNAAttribute<string>,
): number {
  return Math.max(
    0,
    Math.min(1, attribute.confidence),
  );
}

/**
 * Merge Smart Cataloger facts into an existing Craft DNA.
 *
 * Rules:
 * 1. Useful catalog facts may enrich the DNA.
 * 2. "Not provided"/unknown values never overwrite existing facts.
 * 3. Existing high-confidence visual evidence is preserved unless
 *    the catalog contains a useful artisan-provided fact.
 * 4. Catalog-originated values are marked as "catalog".
 */
export function mergeCatalogIntoCraftDNA(
  existing: CraftDNA | null,
  catalog: CraftCatalogDraft,
): CraftDNA {
  const product = catalog.product ?? {};
  const catalogConfidence =
    confidenceFromCatalog(catalog.confidence);

  const now = new Date().toISOString();

  const category =
    findProductValue(product, [
      "category",
      "craftCategory",
      "craft_category",
      "craft type",
      "craftType",
    ]);

  const productType =
    findProductValue(product, [
      "productType",
      "product_type",
      "product",
      "product name",
      "item",
      "name",
    ]);

  const material =
    findProductValue(product, [
      "material",
      "materials",
      "raw material",
      "rawMaterial",
    ]);

  const primaryColour =
    findProductValue(product, [
      "primaryColour",
      "primaryColor",
      "colour",
      "color",
      "main colour",
      "main color",
    ]);

  const secondaryColours =
    findArrayValue(product, [
      "secondaryColours",
      "secondaryColors",
      "secondary colours",
      "secondary colors",
    ]);

  const shape =
    findProductValue(product, [
      "shape",
      "form",
      "structure",
    ]);

  const pattern =
    findProductValue(product, [
      "pattern",
      "motif",
      "design",
    ]);

  const texture =
    findProductValue(product, [
      "texture",
      "surface",
    ]);

  const finish =
    findProductValue(product, [
      "finish",
      "surface finish",
    ]);

  const decoration =
    findProductValue(product, [
      "decoration",
      "decorative details",
      "ornamentation",
    ]);

  const size =
    findProductValue(product, [
      "size",
      "sizeLabel",
      "size label",
    ]);

  const dimensions =
    findProductValue(product, [
      "dimensions",
      "dimension",
      "size dimensions",
    ]);

  const next: CraftDNA = existing
    ? {
        ...existing,
        updatedAt: now,
      }
    : {
        version: "1.0",

        craftCategory: makeAttribute(
          category ?? "Not provided",
          category
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        productType: makeAttribute(
          productType ?? "Not provided",
          productType
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        material: makeAttribute(
          material ?? "Not provided",
          material
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        primaryColour: makeAttribute(
          primaryColour ?? "Not provided",
          primaryColour
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        secondaryColours: makeAttribute(
          secondaryColours,
          secondaryColours.length
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        shape: makeAttribute(
          shape ?? "Not provided",
          shape
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        pattern: makeAttribute(
          pattern ?? "Not provided",
          pattern
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        texture: makeAttribute(
          texture ?? "Not provided",
          texture
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        finish: makeAttribute(
          finish ?? "Not provided",
          finish
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        decoration: makeAttribute(
          decoration ?? "Not provided",
          decoration
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        complexity: makeAttribute(
          5,
          0,
          "catalog",
        ),

        size: makeAttribute(
          size ?? "Not provided",
          size
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        dimensions: makeAttribute(
          dimensions ?? "Not provided",
          dimensions
            ? catalogConfidence
            : 0,
          "catalog",
        ),

        useCase: makeAttribute(
          "Not provided",
          0,
          "catalog",
        ),

        visualCharacteristics: [],

        overallConfidence:
          catalogConfidence,

        createdAt: now,
        updatedAt: now,
      };

  const applyString = (
    current: CraftDNAAttribute<string>,
    value: string | null,
  ): CraftDNAAttribute<string> => {
    if (!value) {
      return current;
    }

    return makeAttribute(
      value,
      Math.max(
        catalogConfidence,
        getCurrentAttributeConfidence(
          current,
        ),
      ),
      "catalog",
    );
  };

  next.craftCategory = applyString(
    next.craftCategory,
    category,
  );

  next.productType = applyString(
    next.productType,
    productType,
  );

  next.material = applyString(
    next.material,
    material,
  );

  next.primaryColour = applyString(
    next.primaryColour,
    primaryColour,
  );

  next.shape = applyString(
    next.shape,
    shape,
  );

  next.pattern = applyString(
    next.pattern,
    pattern,
  );

  next.texture = applyString(
    next.texture,
    texture,
  );

  next.finish = applyString(
    next.finish,
    finish,
  );

  next.decoration = applyString(
    next.decoration,
    decoration,
  );

  next.size = applyString(
    next.size,
    size,
  );

  next.dimensions = applyString(
    next.dimensions,
    dimensions,
  );

  if (secondaryColours.length > 0) {
    next.secondaryColours =
      makeAttribute(
        secondaryColours,
        catalogConfidence,
        "catalog",
      );
  }

  const characteristics = new Set(
    next.visualCharacteristics,
  );

  for (const value of [
    next.primaryColour.value,
    ...next.secondaryColours.value,
    next.shape.value,
    next.pattern.value,
    next.texture.value,
    next.decoration.value,
  ]) {
    if (isUsefulValue(value)) {
      characteristics.add(value);
    }
  }

  next.visualCharacteristics =
    Array.from(characteristics).slice(
      0,
      12,
    );

  next.overallConfidence =
    Math.round(
      Math.max(
        next.overallConfidence,
        catalogConfidence,
      ) * 100,
    ) / 100;

  next.updatedAt = now;

  return next;
}