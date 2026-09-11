import type { CraftDNA } from "./types";

/* =========================================================
   NAVSHAKTHI - CRAFT DNA BUILDER
   =========================================================
   Converts structured visual AI analysis into the shared
   Craft DNA representation.

   Important:
   - Image analysis is the primary source.
   - We do not invent missing visual attributes.
   - Unknown values are represented as "Not provided".
   - Confidence is kept bounded between 0 and 100.
========================================================= */

export interface CraftAnalysisForDNA {
  category: string;
  productType: string;
  material: string;

  primaryColour?: string;
  secondaryColours?: string[];

  shape?: string;
  pattern?: string;
  texture?: string;

  finish: string;
  complexity: number;
  decoration: string;

  sizeLabel: string;
  dimensions: string;

  confidence: number;
}

/* =========================================================
   HELPERS
========================================================= */

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "Not provided";
  }

  return value.trim();
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map((item) => item.trim())
    .filter(
      (item) =>
        item.toLowerCase() !==
          "not provided" &&
        item.toLowerCase() !==
          "unknown",
    );
}

function cleanNumber(
  value: unknown,
  minimum: number,
  maximum: number,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return minimum;
  }

  return Math.min(
    maximum,
    Math.max(
      minimum,
      Math.round(value),
    ),
  );
}

/* =========================================================
   ATTRIBUTE BUILDER
========================================================= */

function attribute<T>(
  value: T,
  confidence: number,
  source:
    | "image"
    | "artisan_voice"
    | "catalog"
    | "manual",
) {
  return {
    value,
    confidence:
      Math.min(
        1,
        Math.max(
          0,
          confidence / 100,
        ),
      ),
    source,
  };
}

/* =========================================================
   USE-CASE INFERENCE
========================================================= */

function inferUseCase(
  productType: string,
  category: string,
): string {
  const text =
    `${productType} ${category}`.toLowerCase();

  if (
    /lamp|lantern|light|diya|deepam/.test(
      text,
    )
  ) {
    return "Lighting / home decor";
  }

  if (
    /pot|vessel|jar|container|basket|box|tray/.test(
      text,
    )
  ) {
    return "Home utility / decor";
  }

  if (
    /saree|shawl|scarf|textile|fabric|cloth|dress/.test(
      text,
    )
  ) {
    return "Wearable textile";
  }

  if (
    /necklace|earring|bracelet|jewellery|jewelry|ornament/.test(
      text,
    )
  ) {
    return "Personal adornment";
  }

  if (
    /toy|doll|figurine|elephant|animal/.test(
      text,
    )
  ) {
    return "Decor / collectible";
  }

  if (
    /instrument|drum|flute|veena|nadaswaram/.test(
      text,
    )
  ) {
    return "Musical use";
  }

  return "Craft / decorative use";
}

/* =========================================================
   VISUAL CHARACTERISTICS
========================================================= */

function buildVisualCharacteristics(
  analysis: CraftAnalysisForDNA,
): string[] {
  const characteristics: string[] = [];

  const primaryColour =
    cleanString(
      analysis.primaryColour,
    );

  if (
    primaryColour !==
    "Not provided"
  ) {
    characteristics.push(
      `Primary colour: ${primaryColour}`,
    );
  }

  const secondaryColours =
    cleanStringArray(
      analysis.secondaryColours,
    );

  if (
    secondaryColours.length > 0
  ) {
    characteristics.push(
      `Secondary colours: ${secondaryColours.join(", ")}`,
    );
  }

  const shape =
    cleanString(
      analysis.shape,
    );

  if (
    shape !== "Not provided"
  ) {
    characteristics.push(
      `Shape: ${shape}`,
    );
  }

  const pattern =
    cleanString(
      analysis.pattern,
    );

  if (
    pattern !== "Not provided"
  ) {
    characteristics.push(
      `Pattern: ${pattern}`,
    );
  }

  const texture =
    cleanString(
      analysis.texture,
    );

  if (
    texture !== "Not provided"
  ) {
    characteristics.push(
      `Texture: ${texture}`,
    );
  }

  const decoration =
    cleanString(
      analysis.decoration,
    );

  if (
    decoration !== "Not provided"
  ) {
    characteristics.push(
      `Decoration: ${decoration}`,
    );
  }

  return characteristics;
}

/* =========================================================
   CRAFT DNA BUILDER
========================================================= */

export function buildCraftDNA(
  analysis: CraftAnalysisForDNA,
): CraftDNA {
  const confidence =
    cleanNumber(
      analysis.confidence,
      0,
      100,
    );

  const complexity =
    cleanNumber(
      analysis.complexity,
      1,
      10,
    );

  const category =
    cleanString(
      analysis.category,
    );

  const productType =
    cleanString(
      analysis.productType,
    );

  const material =
    cleanString(
      analysis.material,
    );

  const primaryColour =
    cleanString(
      analysis.primaryColour,
    );

  const secondaryColours =
    cleanStringArray(
      analysis.secondaryColours,
    );

  const shape =
    cleanString(
      analysis.shape,
    );

  const pattern =
    cleanString(
      analysis.pattern,
    );

  const texture =
    cleanString(
      analysis.texture,
    );

  const finish =
    cleanString(
      analysis.finish,
    );

  const decoration =
    cleanString(
      analysis.decoration,
    );

  const size =
    cleanString(
      analysis.sizeLabel,
    );

  const dimensions =
    cleanString(
      analysis.dimensions,
    );

  const now =
    new Date().toISOString();

  /*
   * Attribute confidence is derived from
   * the overall visual analysis confidence.
   *
   * We intentionally do not pretend that
   * every individual attribute has separate
   * measured confidence.
   */
  const attributeConfidence =
    confidence;

  return {
    version: "1.0",

    craftCategory:
      attribute(
        category,
        attributeConfidence,
        "image",
      ),

    productType:
      attribute(
        productType,
        attributeConfidence,
        "image",
      ),

    material:
      attribute(
        material,
        attributeConfidence,
        "image",
      ),

    primaryColour:
      attribute(
        primaryColour,
        attributeConfidence,
        "image",
      ),

    secondaryColours:
      attribute(
        secondaryColours,
        attributeConfidence,
        "image",
      ),

    shape:
      attribute(
        shape,
        attributeConfidence,
        "image",
      ),

    pattern:
      attribute(
        pattern,
        attributeConfidence,
        "image",
      ),

    texture:
      attribute(
        texture,
        attributeConfidence,
        "image",
      ),

    finish:
      attribute(
        finish,
        attributeConfidence,
        "image",
      ),

    decoration:
      attribute(
        decoration,
        attributeConfidence,
        "image",
      ),

    complexity:
      attribute(
        complexity,
        attributeConfidence,
        "image",
      ),

    size:
      attribute(
        size,
        attributeConfidence,
        "image",
      ),

    dimensions:
      attribute(
        dimensions,
        attributeConfidence,
        "image",
      ),

    useCase:
      attribute(
        inferUseCase(
          productType,
          category,
        ),
        Math.max(
          50,
          confidence - 15,
        ),
        "image",
      ),

    visualCharacteristics:
      buildVisualCharacteristics(
        analysis,
      ),

    overallConfidence:
      confidence / 100,

    createdAt: now,
    updatedAt: now,
  };
}