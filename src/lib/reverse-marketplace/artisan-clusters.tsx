import type { CraftDNA } from "@/lib/craft-dna/types";

export type ArtisanCluster = {
  id: string;
  name: string;
  craftCategory: string;
  craftTypes: string[];
  materials: string[];
  regions: string[];
  capacityPerMonth: number;
  dna: Partial<{
    craftCategory: CraftDNA["craftCategory"];
    productType: CraftDNA["productType"];
    material: CraftDNA["material"];
    primaryColour: CraftDNA["primaryColour"];
    shape: CraftDNA["shape"];
    pattern: CraftDNA["pattern"];
    texture: CraftDNA["texture"];
    finish: CraftDNA["finish"];
  }>;
  description: string;
};

export const artisanClusters: ArtisanCluster[] = [
  {
    id: "kanchipuram-silk-cluster",
    name: "Kanchipuram Weaver Collective",
    craftCategory: "Apparel & Accessories",
    craftTypes: [
      "Kanchipuram Handloom",
      "Silk Weaving",
      "Silk Saree",
      "Silk Accessories",
    ],
    materials: [
      "Mulberry silk",
      "Silk",
      "Zari",
      "Gold-colored zari",
    ],
    regions: ["Tamil Nadu", "Kanchipuram"],
    capacityPerMonth: 1500,
    dna: {
      craftCategory: {
        value: "Apparel & Accessories",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Kanchipuram Handloom Silk",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Mulberry silk and zari",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Traditional handloom weaving cluster specialising in Kanchipuram silk products and zari work.",
  },

  {
    id: "coimbatore-handloom-cluster",
    name: "Coimbatore Handloom Collective",
    craftCategory: "Apparel & Accessories",
    craftTypes: [
      "Handloom",
      "Cotton Weaving",
      "Silk Weaving",
      "Textile Accessories",
    ],
    materials: [
      "Cotton",
      "Silk",
      "Handloom yarn",
    ],
    regions: ["Tamil Nadu", "Coimbatore"],
    capacityPerMonth: 2200,
    dna: {
      craftCategory: {
        value: "Apparel & Accessories",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Handloom Textile",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Cotton and silk",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Handloom artisan network producing traditional and contemporary textile products.",
  },

  {
    id: "swamimalai-brass-cluster",
    name: "Swamimalai Brass Artisan Cluster",
    craftCategory: "Metal Craft",
    craftTypes: [
      "Brass Craft",
      "Brassware",
      "Traditional Metal Craft",
      "Diyas",
    ],
    materials: [
      "Brass",
      "Bronze",
      "Copper",
    ],
    regions: ["Tamil Nadu", "Swamimalai", "Kumbakonam"],
    capacityPerMonth: 1800,
    dna: {
      craftCategory: {
        value: "Metal Craft",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Brassware",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Brass",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Traditional metalworking artisans known for hand-crafted brass objects and ceremonial products.",
  },

  {
    id: "bhuj-terracotta-cluster",
    name: "Bhuj Terracotta Artisan Cluster",
    craftCategory: "Pottery & Terracotta",
    craftTypes: [
      "Terracotta",
      "Pottery",
      "Hand-thrown Pottery",
      "Clay Craft",
    ],
    materials: [
      "Terracotta",
      "Clay",
      "Natural clay",
    ],
    regions: ["Gujarat", "Bhuj", "Kutch"],
    capacityPerMonth: 1200,
    dna: {
      craftCategory: {
        value: "Pottery & Terracotta",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Terracotta Pottery",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Terracotta",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Traditional pottery community creating hand-shaped and hand-thrown terracotta products.",
  },

  {
    id: "assam-jute-cluster",
    name: "Assam Jute Weavers Collective",
    craftCategory: "Natural Fibre Craft",
    craftTypes: [
      "Jute Weaving",
      "Jute Craft",
      "Natural Fibre",
      "Handwoven Bags",
    ],
    materials: [
      "Jute",
      "Natural fibre",
      "Cotton",
    ],
    regions: ["Assam", "Northeast India"],
    capacityPerMonth: 3500,
    dna: {
      craftCategory: {
        value: "Natural Fibre Craft",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Handwoven Jute Products",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Jute",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Natural-fibre artisan network specialising in handwoven jute bags, pouches and packaging products.",
  },

  {
    id: "jaipur-block-print-cluster",
    name: "Jaipur Block Print Artisan Cluster",
    craftCategory: "Textile Craft",
    craftTypes: [
      "Block Printing",
      "Hand Block Print",
      "Textile Craft",
      "Printed Fabric",
    ],
    materials: [
      "Cotton",
      "Silk",
      "Natural fabric",
    ],
    regions: ["Rajasthan", "Jaipur"],
    capacityPerMonth: 2800,
    dna: {
      craftCategory: {
        value: "Textile Craft",
        confidence: 1,
        source: "catalog",
      },
      productType: {
        value: "Hand Block Printed Textile",
        confidence: 1,
        source: "catalog",
      },
      material: {
        value: "Cotton and silk",
        confidence: 1,
        source: "catalog",
      },
    },
    description:
      "Hand block printing community producing patterned textiles using traditional printing methods.",
  },
];