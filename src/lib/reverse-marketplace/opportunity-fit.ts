import type { CraftDNA } from "@/lib/craft-dna/types";
import type { ReverseMarketplaceRequest } from "@/lib/reverse-marketplace/types";

export type OpportunityFitLevel =
  | "strong"
  | "good"
  | "possible";

export type OpportunityFitSignal =
  | "craft"
  | "material"
  | "product"
  | "keywords";

export type OpportunityFitReason = {
  signal: OpportunityFitSignal;
  label: string;
  matched: boolean;
};

export type CraftOpportunityFit = {
  score: number;
  level: OpportunityFitLevel;
  reasons: OpportunityFitReason[];
};

const WEIGHTS = {
  craft: 35,
  material: 30,
  product: 25,
  keywords: 10,
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsMatch(
  first: string,
  second: string,
): boolean {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return false;
  }

  return a.includes(b) || b.includes(a);
}

function tokenOverlap(
  first: string,
  second: string,
): boolean {
  const firstTokens = new Set(
    normalize(first)
      .split(" ")
      .filter((token) => token.length >= 3),
  );

  const secondTokens = normalize(second)
    .split(" ")
    .filter((token) => token.length >= 3);

  if (
    firstTokens.size === 0 ||
    secondTokens.length === 0
  ) {
    return false;
  }

  return secondTokens.some((token) =>
    firstTokens.has(token),
  );
}

function attributeMatches(
  requestText: string,
  value: string,
): boolean {
  if (!value || value === "Not provided") {
    return false;
  }

  return (
    containsMatch(requestText, value) ||
    tokenOverlap(requestText, value)
  );
}

function calculateCraftSignal(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA,
): boolean {
  const requestText = [
    request.requirement,
    request.material ?? "",
  ].join(" ");

  return [
    craftDNA.craftCategory.value,
    craftDNA.productType.value,
  ].some((value) =>
    attributeMatches(requestText, value),
  );
}

function calculateMaterialSignal(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA,
): boolean {
  const material =
    craftDNA.material.value;

  if (
    !material ||
    material === "Not provided"
  ) {
    return false;
  }

  if (request.material) {
    return attributeMatches(
      request.material,
      material,
    );
  }

  return attributeMatches(
    request.requirement,
    material,
  );
}

function calculateProductSignal(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA,
): boolean {
  const product =
    craftDNA.productType.value;

  if (
    !product ||
    product === "Not provided"
  ) {
    return false;
  }

  return attributeMatches(
    request.requirement,
    product,
  );
}

function calculateKeywordSignal(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA,
): boolean {
  const requestText = [
    request.requirement,
    request.material ?? "",
  ].join(" ");

  const dnaText = [
    craftDNA.craftCategory.value,
    craftDNA.productType.value,
    craftDNA.material.value,
    craftDNA.primaryColour.value,
    ...craftDNA.secondaryColours.value,
    craftDNA.shape.value,
    craftDNA.pattern.value,
    craftDNA.texture.value,
    craftDNA.finish.value,
    craftDNA.decoration.value,
    ...craftDNA.visualCharacteristics,
  ].join(" ");

  return tokenOverlap(
    requestText,
    dnaText,
  );
}

export function calculateCraftOpportunityFit(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA | null,
): CraftOpportunityFit {
  if (!craftDNA) {
    return {
      score: 0,
      level: "possible",
      reasons: [
        {
          signal: "craft",
          label:
            "Craft DNA is not available",
          matched: false,
        },
        {
          signal: "material",
          label:
            "Material fit unavailable",
          matched: false,
        },
        {
          signal: "product",
          label:
            "Product fit unavailable",
          matched: false,
        },
        {
          signal: "keywords",
          label:
            "Requirement fit unavailable",
          matched: false,
        },
      ],
    };
  }

  const craftMatched =
    calculateCraftSignal(
      request,
      craftDNA,
    );

  const materialMatched =
    calculateMaterialSignal(
      request,
      craftDNA,
    );

  const productMatched =
    calculateProductSignal(
      request,
      craftDNA,
    );

  const keywordMatched =
    calculateKeywordSignal(
      request,
      craftDNA,
    );

  const score =
    (craftMatched
      ? WEIGHTS.craft
      : 0) +
    (materialMatched
      ? WEIGHTS.material
      : 0) +
    (productMatched
      ? WEIGHTS.product
      : 0) +
    (keywordMatched
      ? WEIGHTS.keywords
      : 0);

  let level: OpportunityFitLevel;

  if (score >= 75) {
    level = "strong";
  } else if (score >= 50) {
    level = "good";
  } else {
    level = "possible";
  }

  return {
    score,
    level,
    reasons: [
      {
        signal: "craft",
        label: craftMatched
          ? "Craft aligns with your Craft DNA"
          : "Craft does not strongly align",
        matched: craftMatched,
      },
      {
        signal: "material",
        label: materialMatched
          ? "Material capability matches"
          : "Material fit is uncertain",
        matched: materialMatched,
      },
      {
        signal: "product",
        label: productMatched
          ? "Product requirement aligns"
          : "Product fit is uncertain",
        matched: productMatched,
      },
      {
        signal: "keywords",
        label: keywordMatched
          ? "Requirement keywords align"
          : "Limited requirement overlap",
        matched: keywordMatched,
      },
    ],
  };
}