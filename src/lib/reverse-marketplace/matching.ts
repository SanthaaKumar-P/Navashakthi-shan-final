import type { CraftDNA } from "@/lib/craft-dna/types";
import type { ReverseMarketplaceRequest } from "./types";
import {
  artisanClusters,
  type ArtisanCluster,
} from "./artisan-clusters";

export type ArtisanMatchLevel =
  | "strong"
  | "good"
  | "possible";

export type ArtisanMatchReason = {
  signal:
    | "craft"
    | "material"
    | "product"
    | "region"
    | "capacity"
    | "keywords";
  label: string;
  matched: boolean;
};

export type ArtisanMatch = {
  cluster: ArtisanCluster;
  score: number;
  level: ArtisanMatchLevel;
  reasons: ArtisanMatchReason[];
};

const WEIGHTS = {
  craft: 30,
  material: 25,
  product: 20,
  region: 10,
  capacity: 10,
  keywords: 5,
} as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function containsMatch(
  source: string,
  candidates: string[],
): boolean {
  const normalizedSource = normalize(source);

  return candidates.some((candidate) => {
    const normalizedCandidate = normalize(candidate);

    return (
      normalizedSource.includes(normalizedCandidate) ||
      normalizedCandidate.includes(normalizedSource)
    );
  });
}

function tokenOverlap(
  source: string,
  candidates: string[],
): boolean {
  const sourceTokens = new Set(
    normalize(source)
      .split(" ")
      .filter((token) => token.length >= 3),
  );

  if (sourceTokens.size === 0) {
    return false;
  }

  return candidates.some((candidate) => {
    const candidateTokens = normalize(candidate)
      .split(" ")
      .filter((token) => token.length >= 3);

    return candidateTokens.some((token) =>
      sourceTokens.has(token),
    );
  });
}

function matchCraft(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
  craftDNA: CraftDNA | null,
): boolean {
  const requestText = [
    request.requirement,
    request.material ?? "",
  ].join(" ");

  if (
    containsMatch(
      requestText,
      cluster.craftTypes,
    )
  ) {
    return true;
  }

  if (craftDNA) {
    return containsMatch(
      craftDNA.craftCategory.value,
      [cluster.craftCategory],
    );
  }

  return false;
}

function matchMaterial(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
  craftDNA: CraftDNA | null,
): boolean {
  if (
    request.material &&
    containsMatch(
      request.material,
      cluster.materials,
    )
  ) {
    return true;
  }

  if (craftDNA) {
    return containsMatch(
      craftDNA.material.value,
      cluster.materials,
    );
  }

  return false;
}

function matchProduct(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
  craftDNA: CraftDNA | null,
): boolean {
  if (
    containsMatch(
      request.requirement,
      cluster.craftTypes,
    )
  ) {
    return true;
  }

  if (craftDNA) {
    return containsMatch(
      craftDNA.productType.value,
      cluster.craftTypes,
    );
  }

  return false;
}

function matchRegion(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
): boolean {
  return containsMatch(
    request.region,
    cluster.regions,
  );
}

function matchCapacity(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
): boolean {
  return request.quantity <= cluster.capacityPerMonth;
}

function matchKeywords(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
): boolean {
  const text = [
    request.requirement,
    request.material ?? "",
    request.region,
  ].join(" ");

  return tokenOverlap(text, [
    cluster.craftCategory,
    ...cluster.craftTypes,
    ...cluster.materials,
    ...cluster.regions,
  ]);
}

function getLevel(
  score: number,
): ArtisanMatchLevel {
  if (score >= 75) {
    return "strong";
  }

  if (score >= 50) {
    return "good";
  }

  return "possible";
}

function buildReasons(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
  craftDNA: CraftDNA | null,
): ArtisanMatchReason[] {
  const craftMatched = matchCraft(
    request,
    cluster,
    craftDNA,
  );

  const materialMatched = matchMaterial(
    request,
    cluster,
    craftDNA,
  );

  const productMatched = matchProduct(
    request,
    cluster,
    craftDNA,
  );

  const regionMatched = matchRegion(
    request,
    cluster,
  );

  const capacityMatched = matchCapacity(
    request,
    cluster,
  );

  const keywordMatched = matchKeywords(
    request,
    cluster,
  );

  return [
    {
      signal: "craft",
      label: craftMatched
        ? `Craft category aligns with ${cluster.craftCategory}.`
        : `Craft category differs from ${cluster.craftCategory}.`,
      matched: craftMatched,
    },
    {
      signal: "material",
      label: materialMatched
        ? `Material is supported by this cluster.`
        : `Requested material is not a primary material for this cluster.`,
      matched: materialMatched,
    },
    {
      signal: "product",
      label: productMatched
        ? `Product type is compatible with the cluster's craft types.`
        : `Product type has limited alignment.`,
      matched: productMatched,
    },
    {
      signal: "region",
      label: regionMatched
        ? `Region is compatible with the artisan cluster.`
        : `Region differs from the cluster's primary region.`,
      matched: regionMatched,
    },
    {
      signal: "capacity",
      label: capacityMatched
        ? `Monthly capacity can cover the requested quantity.`
        : `Requested quantity exceeds the listed monthly capacity.`,
      matched: capacityMatched,
    },
    {
      signal: "keywords",
      label: keywordMatched
        ? `Requirement contains relevant craft or material signals.`
        : `Limited keyword overlap with the cluster profile.`,
      matched: keywordMatched,
    },
  ];
}

export function calculateArtisanMatch(
  request: ReverseMarketplaceRequest,
  cluster: ArtisanCluster,
  craftDNA: CraftDNA | null = null,
): ArtisanMatch {
  const craftMatched = matchCraft(
    request,
    cluster,
    craftDNA,
  );

  const materialMatched = matchMaterial(
    request,
    cluster,
    craftDNA,
  );

  const productMatched = matchProduct(
    request,
    cluster,
    craftDNA,
  );

  const regionMatched = matchRegion(
    request,
    cluster,
  );

  const capacityMatched = matchCapacity(
    request,
    cluster,
  );

  const keywordMatched = matchKeywords(
    request,
    cluster,
  );

  let score = 0;

  if (craftMatched) {
    score += WEIGHTS.craft;
  }

  if (materialMatched) {
    score += WEIGHTS.material;
  }

  if (productMatched) {
    score += WEIGHTS.product;
  }

  if (regionMatched) {
    score += WEIGHTS.region;
  }

  if (capacityMatched) {
    score += WEIGHTS.capacity;
  }

  if (keywordMatched) {
    score += WEIGHTS.keywords;
  }

  const reasons = buildReasons(
    request,
    cluster,
    craftDNA,
  );

  return {
    cluster,
    score,
    level: getLevel(score),
    reasons,
  };
}

export function findArtisanMatches(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA | null = null,
): ArtisanMatch[] {
  return artisanClusters
    .map((cluster) =>
      calculateArtisanMatch(
        request,
        cluster,
        craftDNA,
      ),
    )
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        b.cluster.capacityPerMonth -
        a.cluster.capacityPerMonth
      );
    });
}

export function getTopArtisanMatches(
  request: ReverseMarketplaceRequest,
  craftDNA: CraftDNA | null = null,
  limit = 3,
): ArtisanMatch[] {
  return findArtisanMatches(
    request,
    craftDNA,
  ).slice(0, limit);
}