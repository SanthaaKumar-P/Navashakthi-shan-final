/* =========================================================
   NAVSHAKTHI FUTURE PLANNER
   Craft → Government Market Mapping
   ========================================================= */

import type { CraftMarketMapping } from "./types";

/* =========================================================
   NORMALIZATION
========================================================= */

function normalize(value: string | undefined | null): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s&/-]/g, " ")
    .replace(/\s+/g, " ");
}

/* =========================================================
   UNIQUE VALUES
========================================================= */

function unique(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/* =========================================================
   CATEGORY MAP
========================================================= */

const CRAFT_MAPPINGS: CraftMarketMapping[] = [
  {
    category: "pottery",
    productType: "Pottery & Terracotta",
    material: "Clay / Terracotta",

    governmentKeywords: [
      "pottery",
      "terracotta",
      "clay craft",
      "earthenware",
      "ceramic",
      "handmade pottery",
      "traditional pottery",
    ],

    tradeCategories: [
      "Pottery",
      "Ceramic Products",
      "Terracotta",
      "Ceramic Tableware",
      "Earthenware",
      "Other Ceramic Articles",
    ],

    odopKeywords: [
      "pottery",
      "terracotta",
      "clay",
      "ceramic",
      "earthenware",
      "matka",
      "kulhad",
      "handmade pottery",
    ],

    handicraftEventKeywords: [
      "pottery",
      "terracotta",
      "ceramic",
      "clay",
      "earthenware",
    ],
  },

  {
    category: "textiles",
    productType: "Handloom & Textile Craft",
    material: "Textile / Fabric",

    governmentKeywords: [
      "handloom",
      "textile",
      "handwoven",
      "silk",
      "cotton",
      "wool",
      "fabric",
      "weaving",
      "loom",
      "traditional textile",
    ],

    tradeCategories: [
      "Handloom",
      "Textiles",
      "Silk",
      "Cotton Textiles",
      "Woven Fabrics",
      "Made-up Textile Articles",
      "Handprinted Textiles",
    ],

    odopKeywords: [
      "handloom",
      "silk",
      "cotton",
      "textile",
      "weaving",
      "handwoven",
      "saree",
      "shawl",
      "fabric",
    ],

    handicraftEventKeywords: [
      "handloom",
      "textile",
      "silk",
      "cotton",
      "weaving",
      "handwoven",
    ],
  },

  {
    category: "wood",
    productType: "Wooden Craft",
    material: "Wood",

    governmentKeywords: [
      "wood craft",
      "wooden handicraft",
      "wood carving",
      "carved wood",
      "woodware",
      "wooden decor",
      "wooden toy",
      "wooden sculpture",
    ],

    tradeCategories: [
      "Woodwares",
      "Wooden Handicrafts",
      "Wood Products",
      "Carved Wood",
      "Wooden Furniture",
      "Wooden Decorative Articles",
      "Wooden Toys",
    ],

    odopKeywords: [
      "wood craft",
      "wood carving",
      "woodware",
      "wooden toy",
      "wooden decor",
      "wooden handicraft",
      "carved wood",
      "wooden sculpture",
    ],

    handicraftEventKeywords: [
      "wood",
      "woodcraft",
      "wood carving",
      "wooden",
      "woodware",
      "wooden toy",
    ],
  },

  {
    category: "metal",
    productType: "Metal Craft",
    material: "Metal",

    governmentKeywords: [
      "metal craft",
      "metalware",
      "brassware",
      "brass craft",
      "bronze craft",
      "copper craft",
      "metal handicraft",
      "metal sculpture",
      "metal decor",
    ],

    tradeCategories: [
      "Art Metal Wares",
      "Brassware",
      "Metal Handicrafts",
      "Copperware",
      "Bronzeware",
      "Metal Decorative Articles",
      "Metal Statues",
    ],

    odopKeywords: [
      "brass",
      "bronze",
      "copper",
      "metal craft",
      "metalware",
      "brassware",
      "metal handicraft",
      "metal sculpture",
    ],

    handicraftEventKeywords: [
      "metal",
      "brass",
      "bronze",
      "copper",
      "metalware",
      "metal craft",
    ],
  },

  {
    category: "jewellery",
    productType: "Jewellery & Beadwork",
    material: "Metal / Beads / Mixed",

    governmentKeywords: [
      "jewellery",
      "jewelry",
      "imitation jewellery",
      "fashion jewellery",
      "beadwork",
      "beaded craft",
      "ornament",
      "handmade jewellery",
      "silver jewellery",
    ],

    tradeCategories: [
      "Imitation Jewellery",
      "Artificial Jewellery",
      "Jewellery",
      "Beadwork",
      "Ornaments",
      "Silver Jewellery",
      "Fashion Jewellery",
    ],

    odopKeywords: [
      "jewellery",
      "jewelry",
      "beadwork",
      "beads",
      "ornament",
      "silver",
      "handmade jewellery",
      "imitation jewellery",
    ],

    handicraftEventKeywords: [
      "jewellery",
      "jewelry",
      "beadwork",
      "ornament",
      "silver",
    ],
  },

  {
    category: "bamboo",
    productType: "Bamboo & Cane Craft",
    material: "Bamboo / Cane",

    governmentKeywords: [
      "bamboo craft",
      "cane craft",
      "bamboo handicraft",
      "cane handicraft",
      "basketry",
      "bamboo products",
      "cane products",
      "bamboo decor",
      "basket",
    ],

    tradeCategories: [
      "Bamboo Products",
      "Cane Products",
      "Basketry",
      "Bamboo Handicrafts",
      "Cane Handicrafts",
      "Natural Fibre Products",
    ],

    odopKeywords: [
      "bamboo",
      "cane",
      "basket",
      "basketry",
      "bamboo craft",
      "cane craft",
      "bamboo handicraft",
      "bamboo products",
    ],

    handicraftEventKeywords: [
      "bamboo",
      "cane",
      "basket",
      "basketry",
      "natural fibre",
    ],
  },

  {
    category: "stone",
    productType: "Stone Carving & Sculpture",
    material: "Stone",

    governmentKeywords: [
      "stone craft",
      "stone carving",
      "stone sculpture",
      "marble craft",
      "granite craft",
      "soapstone",
      "stone handicraft",
      "carved stone",
    ],

    tradeCategories: [
      "Stone Handicrafts",
      "Marble Products",
      "Stone Carvings",
      "Stone Sculptures",
      "Granite Products",
      "Soapstone Articles",
    ],

    odopKeywords: [
      "stone",
      "stone carving",
      "marble",
      "granite",
      "soapstone",
      "stone sculpture",
      "stone handicraft",
    ],

    handicraftEventKeywords: [
      "stone",
      "marble",
      "granite",
      "stone carving",
      "sculpture",
    ],
  },

  {
    category: "instruments",
    productType: "Folk Musical Instruments",
    material: "Wood / Metal / Natural Materials",

    governmentKeywords: [
      "musical instrument",
      "folk instrument",
      "traditional instrument",
      "handmade instrument",
      "string instrument",
      "percussion instrument",
      "wooden instrument",
    ],

    tradeCategories: [
      "Musical Instruments",
      "Traditional Musical Instruments",
      "Folk Instruments",
      "String Instruments",
      "Percussion Instruments",
    ],

    odopKeywords: [
      "musical instrument",
      "folk instrument",
      "traditional instrument",
      "drum",
      "flute",
      "veena",
      "instrument",
    ],

    handicraftEventKeywords: [
      "musical instrument",
      "folk instrument",
      "traditional instrument",
      "instrument",
    ],
  },

  {
    category: "leather",
    productType: "Leather Craft",
    material: "Leather",

    governmentKeywords: [
      "leather craft",
      "leather handicraft",
      "leather goods",
      "traditional leather",
      "handmade leather",
      "leather products",
    ],

    tradeCategories: [
      "Leather Goods",
      "Leather Handicrafts",
      "Leather Products",
      "Traditional Leather Products",
    ],

    odopKeywords: [
      "leather",
      "leather craft",
      "leather goods",
      "leather handicraft",
      "leather products",
    ],

    handicraftEventKeywords: [
      "leather",
      "leather craft",
      "leather goods",
      "leather handicraft",
    ],
  },

  {
    category: "natural-fibre",
    productType: "Natural Fibre Craft",
    material: "Natural Fibre",

    governmentKeywords: [
      "natural fibre",
      "jute craft",
      "coir craft",
      "grass craft",
      "fibre handicraft",
      "natural fibre handicraft",
      "jute products",
      "coir products",
    ],

    tradeCategories: [
      "Jute Products",
      "Coir Products",
      "Natural Fibre Products",
      "Fibre Handicrafts",
    ],

    odopKeywords: [
      "jute",
      "coir",
      "natural fibre",
      "grass",
      "fibre craft",
      "jute craft",
      "coir craft",
    ],

    handicraftEventKeywords: [
      "jute",
      "coir",
      "natural fibre",
      "fibre",
      "grass",
    ],
  },
];

/* =========================================================
   GENERIC FALLBACK
========================================================= */

const FALLBACK_MAPPING: CraftMarketMapping = {
  category: "craft",

  productType: "Handicraft",

  material: "Not specified",

  governmentKeywords: [
    "handicraft",
    "handmade",
    "artisan craft",
    "traditional craft",
  ],

  tradeCategories: [
    "Handicrafts",
    "Handmade Products",
    "Artisan Products",
  ],

  odopKeywords: [
    "handicraft",
    "handmade",
    "artisan",
    "traditional craft",
  ],

  handicraftEventKeywords: [
    "handicraft",
    "handmade",
    "artisan",
    "craft",
  ],
};

/* =========================================================
   MATERIAL → CATEGORY HINTS
========================================================= */

const MATERIAL_HINTS: Record<string, string[]> = {
  clay: ["pottery"],
  terracotta: ["pottery"],
  ceramic: ["pottery"],

  silk: ["textiles"],
  cotton: ["textiles"],
  wool: ["textiles"],
  textile: ["textiles"],
  fabric: ["textiles"],
  handloom: ["textiles"],

  wood: ["wood"],
  teak: ["wood"],
  rosewood: ["wood"],

  brass: ["metal"],
  bronze: ["metal"],
  copper: ["metal"],
  iron: ["metal"],

  bamboo: ["bamboo"],
  cane: ["bamboo"],

  stone: ["stone"],
  marble: ["stone"],
  granite: ["stone"],
  soapstone: ["stone"],

  leather: ["leather"],

  jute: ["natural-fibre"],
  coir: ["natural-fibre"],
};

/* =========================================================
   SCORE CATEGORY
========================================================= */

function scoreMapping(
  mapping: CraftMarketMapping,
  category: string,
  productType: string,
  material: string,
): number {
  const categoryText = normalize(category);
  const productText = normalize(productType);
  const materialText = normalize(material);

  const mappingText = normalize(
    [
      mapping.category,
      mapping.productType,
      mapping.material,
      ...mapping.governmentKeywords,
      ...mapping.odopKeywords,
    ].join(" "),
  );

  let score = 0;

  /* Exact category match */
  if (
    categoryText &&
    normalize(mapping.category) === categoryText
  ) {
    score += 100;
  }

  /* Category appears in mapping */
  if (
    categoryText &&
    mappingText.includes(categoryText)
  ) {
    score += 40;
  }

  /* Product type keyword match */
  const productWords = productText
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  for (const word of productWords) {
    if (mappingText.includes(word)) {
      score += 12;
    }
  }

  /* Material match */
  const materialWords = materialText
    .split(/\s+/)
    .filter((word) => word.length >= 3);

  for (const word of materialWords) {
    if (mappingText.includes(word)) {
      score += 15;
    }
  }

  return score;
}

/* =========================================================
   FIND BEST MAPPING
========================================================= */

export function mapCraftToGovernmentMarket(
  category: string,
  productType: string,
  material: string,
): CraftMarketMapping {
  const normalizedCategory = normalize(category);
  const normalizedProduct = normalize(productType);
  const normalizedMaterial = normalize(material);

  /* -------------------------------------------------------
     1. Strong category match
  ------------------------------------------------------- */

  const exactCategory = CRAFT_MAPPINGS.find(
    (mapping) =>
      normalize(mapping.category) === normalizedCategory,
  );

  if (exactCategory) {
    return {
      ...exactCategory,

      /*
       * Preserve the actual detected product/material.
       * This makes the mapping more useful downstream.
       */
      productType:
        productType.trim() ||
        exactCategory.productType,

      material:
        material.trim() ||
        exactCategory.material,
    };
  }

  /* -------------------------------------------------------
     2. Score all mappings
  ------------------------------------------------------- */

  const scored = CRAFT_MAPPINGS
    .map((mapping) => ({
      mapping,
      score: scoreMapping(
        mapping,
        category,
        productType,
        material,
      ),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best && best.score > 0) {
    return {
      ...best.mapping,

      productType:
        productType.trim() ||
        best.mapping.productType,

      material:
        material.trim() ||
        best.mapping.material,
    };
  }

  /* -------------------------------------------------------
     3. Material-only hint
  ------------------------------------------------------- */

  for (const [materialKeyword, categories] of Object.entries(
    MATERIAL_HINTS,
  )) {
    if (!normalizedMaterial.includes(materialKeyword)) {
      continue;
    }

    const hinted = CRAFT_MAPPINGS.find(
      (mapping) =>
        categories.includes(mapping.category),
    );

    if (hinted) {
      return {
        ...hinted,

        productType:
          productType.trim() ||
          hinted.productType,

        material:
          material.trim() ||
          hinted.material,
      };
    }
  }

  /* -------------------------------------------------------
     4. Fallback
  ------------------------------------------------------- */

  return {
    ...FALLBACK_MAPPING,

    category:
      category.trim() ||
      FALLBACK_MAPPING.category,

    productType:
      productType.trim() ||
      FALLBACK_MAPPING.productType,

    material:
      material.trim() ||
      FALLBACK_MAPPING.material,
  };
}

/* =========================================================
   MERGE CUSTOM KEYWORDS
========================================================= */

export function enrichCraftMarketMapping(
  mapping: CraftMarketMapping,
  additionalKeywords: string[] = [],
): CraftMarketMapping {
  const cleanKeywords = unique(
    additionalKeywords,
  );

  return {
    ...mapping,

    governmentKeywords: unique([
      ...mapping.governmentKeywords,
      ...cleanKeywords,
    ]),

    tradeCategories: unique([
      ...mapping.tradeCategories,
      ...cleanKeywords,
    ]),

    odopKeywords: unique([
      ...mapping.odopKeywords,
      ...cleanKeywords,
    ]),

    handicraftEventKeywords: unique([
      ...mapping.handicraftEventKeywords,
      ...cleanKeywords,
    ]),
  };
}

/* =========================================================
   CATEGORY LIST
========================================================= */

export function getSupportedCraftCategories(): string[] {
  return CRAFT_MAPPINGS.map(
    (mapping) => mapping.category,
  );
}

/* =========================================================
   ALL MAPPINGS
========================================================= */

export function getCraftMarketMappings(): CraftMarketMapping[] {
  return CRAFT_MAPPINGS.map((mapping) => ({
    ...mapping,

    governmentKeywords: [
      ...mapping.governmentKeywords,
    ],

    tradeCategories: [
      ...mapping.tradeCategories,
    ],

    odopKeywords: [
      ...mapping.odopKeywords,
    ],

    handicraftEventKeywords: [
      ...mapping.handicraftEventKeywords,
    ],
  }));
}