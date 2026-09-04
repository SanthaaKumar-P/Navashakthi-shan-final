import { createFileRoute } from "@tanstack/react-router";

export type MarketSourceType =
  | "curated_reference"
  | "official_reference";

export interface MarketData {
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

interface MarketProfile {
  id: string;
  category: string;
  product: string;
  aliases: string[];
  materials: string[];
  prices: number[];
  demandChange: number;
  sourceType: MarketSourceType;
  sourceLabel: string;
}

const MARKET_PROFILES: MarketProfile[] = [
  // ---------------- POTTERY ----------------
  {
    id: "pottery-cooking-pot",
    category: "Pottery",
    product: "Terracotta cooking pot / handi",
    aliases: ["cooking pot", "handi", "clay pot", "terracotta pot", "cooking vessel"],
    materials: ["terracotta", "clay", "earthenware"],
    prices: [80, 100, 120, 150, 180, 220, 300],
    demandChange: 8,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated pottery reference set",
  },
  {
    id: "pottery-water-filter",
    category: "Pottery",
    product: "Clay water filter / purifier",
    aliases: ["water filter", "clay filter", "water purifier", "ceramic filter", "gravity filter"],
    materials: ["terracotta", "clay", "ceramic"],
    prices: [300, 400, 500, 650, 800, 1100, 1500],
    demandChange: 10,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated functional-pottery reference set",
  },
  {
    id: "pottery-water-dispenser",
    category: "Pottery",
    product: "Terracotta water dispenser / matka with tap",
    aliases: ["water dispenser", "water pot with tap", "matka with tap", "clay dispenser", "water storage pot"],
    materials: ["terracotta", "clay", "earthenware"],
    prices: [350, 500, 650, 800, 1000, 1300, 1800],
    demandChange: 9,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated functional-pottery reference set",
  },
  {
    id: "pottery-matka",
    category: "Pottery",
    product: "Terracotta matka / water storage pot",
    aliases: ["matka", "water pot", "earthen pot", "storage pot", "drinking water pot"],
    materials: ["terracotta", "clay", "earthenware"],
    prices: [150, 200, 250, 350, 450, 650, 900],
    demandChange: 8,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated pottery reference set",
  },
  {
    id: "pottery-decorative",
    category: "Pottery",
    product: "Decorative terracotta pot / planter",
    aliases: ["decorative pot", "planter", "flower pot", "terracotta planter", "decorative planter"],
    materials: ["terracotta", "clay", "earthenware"],
    prices: [150, 220, 300, 400, 550, 700, 900],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated decorative-pottery reference set",
  },
  {
    id: "pottery-serving",
    category: "Pottery",
    product: "Terracotta serving / chaas pot",
    aliases: ["serving pot", "chaas pot", "buttermilk pot", "serving vessel", "small clay pot"],
    materials: ["terracotta", "clay"],
    prices: [100, 140, 180, 220, 280, 350],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated pottery reference set",
  },
  {
    id: "pottery-generic",
    category: "Pottery",
    product: "General terracotta pottery",
    aliases: ["pottery", "clay craft", "terracotta craft", "earthenware"],
    materials: ["terracotta", "clay", "earthenware"],
    prices: [55, 75, 85, 120, 150, 180, 250],
    demandChange: 8,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated pottery reference set",
  },

  // ---------------- HANDLOOM ----------------
  {
    id: "textile-silk-saree",
    category: "Handloom & Textiles",
    product: "Handwoven silk saree",
    aliases: ["silk saree", "silk sari", "silk handloom saree", "silk embroidered saree"],
    materials: ["silk", "silk fabric"],
    prices: [2200, 3000, 4000, 5500, 7000, 9500, 15000],
    demandChange: 11,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated silk-handloom reference set",
  },
  {
    id: "textile-cotton-saree",
    category: "Handloom & Textiles",
    product: "Handwoven cotton saree",
    aliases: ["cotton saree", "cotton sari", "cotton handloom", "cotton embroidered saree"],
    materials: ["cotton", "cotton fabric"],
    prices: [600, 800, 1000, 1300, 1700, 2300, 3200],
    demandChange: 9,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated cotton-handloom reference set",
  },
  {
    id: "textile-embroidered",
    category: "Handloom & Textiles",
    product: "Embroidered handloom saree",
    aliases: ["embroidered saree", "embroidered sari", "hand embroidery saree", "zari saree"],
    materials: ["silk", "cotton", "textile", "fabric"],
    prices: [1200, 1800, 2500, 3500, 5000, 7000, 10000],
    demandChange: 11,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated embroidered-textile reference set",
  },
  {
    id: "textile-dupatta",
    category: "Handloom & Textiles",
    product: "Handwoven / embroidered dupatta",
    aliases: ["dupatta", "stole", "shawl", "scarf", "embroidered dupatta"],
    materials: ["silk", "cotton", "wool", "textile", "fabric"],
    prices: [500, 700, 900, 1200, 1600, 2200, 3000],
    demandChange: 8,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated textile accessory reference set",
  },
  {
    id: "textile-generic",
    category: "Handloom & Textiles",
    product: "General handloom textile",
    aliases: ["saree", "sari", "handloom", "textile", "fabric", "woven craft"],
    materials: ["silk", "cotton", "wool", "textile", "fabric"],
    prices: [450, 600, 850, 1100, 1500, 1800, 2500],
    demandChange: 11,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated handloom reference set",
  },

  // ---------------- JEWELRY ----------------
  {
    id: "jewelry-gold-diamond",
    category: "Jewelry & Beadwork",
    product: "Gold and diamond necklace / choker",
    aliases: ["diamond necklace", "diamond choker", "gold necklace", "gold choker", "diamond jewellery", "diamond jewelry"],
    materials: ["gold", "diamond", "precious metal", "precious stone"],
    prices: [25000, 40000, 55000, 75000, 100000, 140000, 200000],
    demandChange: 6,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated precious-jewellery reference set",
  },
  {
    id: "jewelry-kundan",
    category: "Jewelry & Beadwork",
    product: "Kundan jewellery set",
    aliases: ["kundan", "kundan necklace", "kundan set", "maang tikka", "bridal kundan"],
    materials: ["kundan", "gold", "faux gemstones", "stones", "beads"],
    prices: [1800, 2500, 3500, 5000, 7000, 10000, 15000],
    demandChange: 10,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated traditional-jewellery reference set",
  },
  {
    id: "jewelry-silver",
    category: "Jewelry & Beadwork",
    product: "Silver handcrafted jewellery",
    aliases: ["silver necklace", "silver jewellery", "silver jewelry", "silver earrings", "silver tribal jewellery"],
    materials: ["silver", "sterling silver", "metal"],
    prices: [800, 1200, 1800, 2500, 3500, 5000, 7500],
    demandChange: 8,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated silver-jewellery reference set",
  },
  {
    id: "jewelry-beaded",
    category: "Jewelry & Beadwork",
    product: "Beaded / artisan fashion jewellery",
    aliases: ["beaded necklace", "bead jewellery", "bead jewelry", "fashion jewellery", "fashion jewelry", "artisan necklace"],
    materials: ["beads", "glass beads", "thread", "stones", "faux gemstones"],
    prices: [200, 300, 450, 650, 900, 1300, 1800],
    demandChange: 12,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated artisan-jewellery reference set",
  },
  {
    id: "jewelry-generic",
    category: "Jewelry & Beadwork",
    product: "General handcrafted jewellery",
    aliases: ["necklace", "jewellery", "jewelry", "earrings", "ornament"],
    materials: ["metal", "beads", "stones", "gold", "silver"],
    prices: [180, 300, 550, 800, 1200, 1800, 3000],
    demandChange: 10,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated jewellery reference set",
  },

  // ---------------- METAL / DHOKRA ----------------
  {
    id: "metal-dhokra-fish",
    category: "Metal Casting",
    product: "Dhokra brass fish figurine",
    aliases: ["dhokra fish", "brass fish", "fish figurine", "dhokra animal", "dokra fish"],
    materials: ["brass", "bronze", "dhokra metal", "bell metal"],
    prices: [700, 1000, 1500, 2200, 3000, 4500, 6500],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated Dhokra reference set",
  },
  {
    id: "metal-dhokra-figurine",
    category: "Metal Casting",
    product: "Dhokra tribal metal figurine",
    aliases: ["dhokra figurine", "dokra figurine", "tribal figurine", "tribal metal figure", "dancing tribal figure"],
    materials: ["brass", "bronze", "dhokra metal", "bell metal"],
    prices: [800, 1200, 1800, 2500, 3500, 5000, 8000],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated Dhokra reference set",
  },
  {
    id: "metal-brass-figurine",
    category: "Metal Casting",
    product: "Handcrafted brass figurine",
    aliases: ["brass figurine", "brass statue", "brass figure", "metal figurine"],
    materials: ["brass", "bronze", "metal"],
    prices: [900, 1300, 1800, 2500, 3500, 5000],
    demandChange: 6,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated metal-craft reference set",
  },
  {
    id: "metal-generic",
    category: "Metal Casting",
    product: "General metal craft",
    aliases: ["metal craft", "metal casting", "brass craft", "bronze craft", "metal statue"],
    materials: ["brass", "bronze", "metal", "bell metal"],
    prices: [450, 650, 950, 1300, 1800, 2400, 3500],
    demandChange: 5,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated metal-craft reference set",
  },

  // ---------------- WOOD ----------------
  {
    id: "wood-decorative",
    category: "Wooden Crafts",
    product: "Hand-carved wooden decorative craft",
    aliases: ["wood carving", "wooden decor", "wooden sculpture", "wood craft", "carved wood"],
    materials: ["wood", "teak", "sandalwood"],
    prices: [300, 500, 700, 1000, 1500, 2200, 3500],
    demandChange: 6,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated wood-craft reference set",
  },
  {
    id: "wood-generic",
    category: "Wooden Crafts",
    product: "General wooden craft",
    aliases: ["wooden craft", "wood craft", "wooden product", "carved wooden item"],
    materials: ["wood", "teak", "sandalwood"],
    prices: [250, 400, 650, 900, 1400, 2000, 3000],
    demandChange: 6,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated wood-craft reference set",
  },

  // ---------------- BAMBOO ----------------
  {
    id: "bamboo-lantern",
    category: "Bamboo & Cane Products",
    product: "Bamboo / cane lantern",
    aliases: ["bamboo lantern", "cane lantern", "bamboo light", "woven lantern"],
    materials: ["bamboo", "cane", "rattan"],
    prices: [250, 350, 450, 600, 800, 1100, 1600],
    demandChange: 9,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated bamboo-craft reference set",
  },
  {
    id: "bamboo-basket",
    category: "Bamboo & Cane Products",
    product: "Handwoven bamboo / cane basket",
    aliases: ["bamboo basket", "cane basket", "woven basket", "rattan basket"],
    materials: ["bamboo", "cane", "rattan"],
    prices: [150, 250, 350, 500, 700, 1000, 1400],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated bamboo-craft reference set",
  },
  {
    id: "bamboo-generic",
    category: "Bamboo & Cane Products",
    product: "General bamboo / cane craft",
    aliases: ["bamboo craft", "cane craft", "bamboo product", "cane product"],
    materials: ["bamboo", "cane", "rattan"],
    prices: [120, 200, 350, 500, 700, 900, 1300],
    demandChange: 7,
    sourceType: "curated_reference",
    sourceLabel: "NAVSHAKTHI curated bamboo-craft reference set",
  },
];

const CATEGORY_FALLBACK: Record<string, MarketData> = {
  Pottery: { low: 55, median: 120, high: 300, demandChange: 8, comparableCount: 7, matchLabel: "General pottery reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Handloom & Textiles": { low: 450, median: 1000, high: 2500, demandChange: 10, comparableCount: 7, matchLabel: "General handloom reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Wooden Crafts": { low: 250, median: 650, high: 1800, demandChange: 6, comparableCount: 7, matchLabel: "General wood-craft reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Metal Casting": { low: 450, median: 950, high: 3000, demandChange: 6, comparableCount: 7, matchLabel: "General metal-craft reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Jewelry & Beadwork": { low: 180, median: 550, high: 3000, demandChange: 10, comparableCount: 7, matchLabel: "General jewellery reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Folk & Tribal Art": { low: 150, median: 500, high: 1500, demandChange: 9, comparableCount: 7, matchLabel: "General folk-art reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Bamboo & Cane Products": { low: 120, median: 350, high: 1300, demandChange: 7, comparableCount: 7, matchLabel: "General bamboo-craft reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Sculptures & Stone Carving": { low: 500, median: 1400, high: 5000, demandChange: 4, comparableCount: 7, matchLabel: "General sculpture reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
  "Folk Musical Instruments": { low: 500, median: 1200, high: 3500, demandChange: 10, comparableCount: 7, matchLabel: "General instrument reference", sourceType: "curated_reference", sourceLabel: "NAVSHAKTHI curated reference dataset", updatedAt: "2026-09-04", materialCostReference: 100, labourBenchmark: 60 },
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function singularizeToken(token: string) {
  if (token.endsWith("ies") && token.length > 4) {
    return `${token.slice(0, -3)}y`;
  }

  if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) {
    return token.slice(0, -1);
  }

  return token;
}

function tokens(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 2)
    .map(singularizeToken);
}

function scoreProfile(
  profile: MarketProfile,
  productType: string,
  material: string,
  category: string,
) {
  if (profile.category !== category) return 0;

  const productText = normalize(productType);
  const queryText = normalize(`${productType} ${material}`);
  const queryTokens = new Set(tokens(queryText));
  const productTokens = new Set(tokens(productText));
  let score = 8;

  // Exact product phrase is the strongest signal.
  const profileProduct = normalize(profile.product);
  if (productText.includes(profileProduct) || profileProduct.includes(productText)) {
    score += 55;
  }

  for (const alias of profile.aliases) {
    const aliasText = normalize(alias);

    if (productText.includes(aliasText)) {
      score += 48;
    } else if (queryText.includes(aliasText)) {
      score += 30;
    }

    for (const token of tokens(alias)) {
      if (productTokens.has(token)) {
        score += 12;
      } else if (queryTokens.has(token)) {
        score += 5;
      }
    }
  }

  // Material is a secondary discriminator.
  const normalizedMaterial = normalize(material);
  for (const materialName of profile.materials) {
    const materialText = normalize(materialName);
    if (normalizedMaterial.includes(materialText)) {
      score += 18;
    }
  }

  return Math.min(score, 100);
}

function percentile(sorted: number[], p: number) {
  if (sorted.length === 0) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function sizeAdjustment(sizeLabel: string) {
  switch (sizeLabel) {
    case "Mini": return 0.75;
    case "Small": return 0.88;
    case "Medium": return 1.10;
    case "Large": return 1.25;
    case "Extra Large": return 1.45;
    case "Monumental": return 1.75;
    default: return 1;
  }
}

function costReference(profileId: string) {
  const references: Record<string, { material: number; labour: number }> = {
    "pottery-cooking-pot": { material: 25, labour: 35 },
    "pottery-water-filter": { material: 85, labour: 45 },
    "pottery-water-dispenser": { material: 70, labour: 45 },
    "pottery-matka": { material: 45, labour: 40 },
    "pottery-decorative": { material: 40, labour: 42 },
    "pottery-serving": { material: 25, labour: 35 },
    "textile-silk-saree": { material: 900, labour: 90 },
    "textile-cotton-saree": { material: 350, labour: 70 },
    "textile-embroidered": { material: 500, labour: 80 },
    "textile-dupatta": { material: 180, labour: 65 },
    "jewelry-gold-diamond": { material: 12000, labour: 350 },
    "jewelry-kundan": { material: 900, labour: 100 },
    "jewelry-silver": { material: 900, labour: 90 },
    "jewelry-beaded": { material: 100, labour: 60 },
    "metal-dhokra-fish": { material: 250, labour: 70 },
    "metal-dhokra-figurine": { material: 300, labour: 75 },
    "metal-brass-figurine": { material: 350, labour: 70 },
    "wood-decorative": { material: 180, labour: 60 },
    "bamboo-lantern": { material: 70, labour: 50 },
    "bamboo-basket": { material: 55, labour: 45 },
  };

  return references[profileId] ?? { material: 100, labour: 60 };
}

function buildMarketData(
  profile: MarketProfile,
  sizeLabel: string,
  complexity: number,
  matchScore: number,
): MarketData {
  const craftAdjustment = 0.94 + Math.min(Math.max(complexity, 1), 10) * 0.012;
  const scale = sizeAdjustment(sizeLabel) * craftAdjustment;
  const prices = [...profile.prices].sort((a, b) => a - b).map((price) => price * scale);

  return {
    low: Math.max(5, Math.round(percentile(prices, 0.10) / 5) * 5),
    median: Math.max(5, Math.round(percentile(prices, 0.50) / 5) * 5),
    high: Math.max(5, Math.round(percentile(prices, 0.90) / 5) * 5),
    demandChange: profile.demandChange,
    comparableCount: profile.prices.length,
    matchLabel: `${profile.product} (${Math.round(matchScore)}% match)`,
    sourceType: profile.sourceType,
    sourceLabel: profile.sourceLabel,
    updatedAt: "2026-09-04",
    materialCostReference: costReference(profile.id).material,
    labourBenchmark: costReference(profile.id).labour,
  };
}

export const Route = createFileRoute("/api/pricing/market")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const category = url.searchParams.get("category")?.trim() ?? "";
          const productType = url.searchParams.get("productType")?.trim() ?? "";
          const material = url.searchParams.get("material")?.trim() ?? "";
          const sizeLabel = url.searchParams.get("sizeLabel")?.trim() ?? "Standard";
          const complexity = Number(url.searchParams.get("complexity") ?? 5);

          if (!category) {
            return Response.json(
              { success: false, error: "Missing craft category." },
              { status: 400 },
            );
          }

          const candidates = MARKET_PROFILES
            .map((profile) => ({
              profile,
              score: scoreProfile(profile, productType, material, category),
            }))
            .filter((item) => item.score > 8)
            .sort((a, b) => b.score - a.score);

          const best = candidates[0];

          if (best && best.score >= 38) {
            return Response.json({
              success: true,
              market: buildMarketData(
                best.profile,
                sizeLabel,
                Number.isFinite(complexity) ? complexity : 5,
                best.score,
              ),
            });
          }

          const fallback = CATEGORY_FALLBACK[category];
          if (!fallback) {
            return Response.json(
              { success: false, error: "No market reference available for this craft category." },
              { status: 404 },
            );
          }

          return Response.json({
            success: true,
            market: fallback,
          });
        } catch (error) {
          console.error("NAVSHAKTHI market intelligence error:", error);
          return Response.json(
            { success: false, error: "Unable to retrieve market reference data." },
            { status: 500 },
          );
        }
      },
    },
  },
});
