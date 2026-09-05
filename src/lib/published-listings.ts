import { getArtisanListings, type CraftDraft } from "./craft-draft";
import type { Product } from "./mock-data";
import fallbackImage from "@/assets/product-pottery.jpg";

export const SELF_ARTISAN_ID = "artisan-self";

export interface PublishedProduct extends Product {
  aiPublished: true;
  images: string[];
  attributes: Record<string, string>;
  priceLow: number;
  priceHigh: number;
  confidence: number;
  marketBenchmark: number | null;
  metaDescription?: string;
  seoKeywords: string[];
  artisanId: string;
  draft: CraftDraft;
}

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["pottery", ["pot", "clay", "terracotta", "ceramic", "pottery"]],
  ["textiles", ["saree", "silk", "textile", "fabric", "cotton", "weave"]],
  ["metal", ["brass", "bronze", "metal", "copper", "iron"]],
  ["wood", ["wood", "teak", "rosewood", "carv"]],
  ["bamboo", ["bamboo", "cane", "basket"]],
  ["jewellery", ["jewel", "necklace", "earring", "kundan", "silver"]],
  ["stone", ["stone", "granite", "marble", "soapstone"]],
  ["handloom", ["handloom", "loom", "shawl"]],
  ["instruments", ["drum", "veena", "flute", "instrument"]],
];

function toCategorySlug(raw: string | undefined, title: string) {
  const hay = `${raw ?? ""} ${title}`.toLowerCase();
  for (const [slug, words] of CATEGORY_KEYWORDS) {
    if (words.some((w) => hay.includes(w))) return slug;
  }
  return (raw ?? "craft").toLowerCase().replace(/\s+/g, "-");
}

function pick(attrs: Record<string, string>, keys: string[]) {
  for (const k of Object.keys(attrs)) {
    if (keys.some((key) => k.toLowerCase().includes(key))) {
      const v = attrs[k];
      if (v && String(v).trim()) return String(v).trim();
    }
  }
  return undefined;
}

export function draftToProduct(draft: CraftDraft): PublishedProduct {
  const attrs = draft.catalog?.product ?? {};
  const title =
    draft.catalog?.english?.title?.trim() ||
    pick(attrs, ["name", "product"]) ||
    "Handcrafted artisan piece";
  const description =
    draft.catalog?.english?.description?.trim() ||
    "A handmade craft published through the NAVSHAKTHI AI studio.";
  const images = [draft.image?.enhancedImage, draft.image?.originalImage].filter(
    (x): x is string => Boolean(x),
  );
  const price = Math.max(1, Math.round(draft.pricing?.recommended ?? 0)) || 999;
  const high = Math.round(draft.pricing?.high ?? Math.round(price * 1.25));
  const confidencePct = Math.round(
    ((draft.pricing?.confidence ?? draft.catalog?.confidence ?? 0.9) <= 1
      ? (draft.pricing?.confidence ?? draft.catalog?.confidence ?? 0.9) * 100
      : (draft.pricing?.confidence ?? 90)),
  );

  return {
    id: draft.id,
    name: title,
    category: toCategorySlug(pick(attrs, ["category", "craft"]), title),
    price,
    mrp: Math.max(high, Math.round(price * 1.2)),
    image: images[0] ?? fallbackImage,
    images: images.length ? images : [fallbackImage],
    rating: 5,
    reviews: 0,
    artisan: pick(attrs, ["artisan", "maker"]) ?? "NAVSHAKTHI artisan",
    village: pick(attrs, ["village", "origin", "place"]) ?? "India",
    state: pick(attrs, ["state", "region"]) ?? "",
    story: description,
    materials: (pick(attrs, ["material"]) ?? "Handmade")
      .split(/[,/]/)
      .map((m) => m.trim())
      .filter(Boolean),
    authenticity: Math.min(100, Math.max(0, confidencePct)),
    craftmark: false,
    giCertified: false,
    digitalTwin: false,
    inStock: 5,
    aiPublished: true,
    attributes: attrs,
    priceLow: Math.round(draft.pricing?.low ?? Math.round(price * 0.85)),
    priceHigh: high,
    confidence: confidencePct,
    marketBenchmark: draft.pricing?.marketBenchmark ?? null,
    metaDescription: draft.catalog?.english?.metaDescription,
    seoKeywords: draft.catalog?.seoKeywords ?? [],
    artisanId: SELF_ARTISAN_ID,
    draft,
  };
}

export function getPublishedProducts(): PublishedProduct[] {
  try {
    return getArtisanListings()
      .filter((d) => d && d.status === "published")
      .map(draftToProduct);
  } catch {
    return [];
  }
}

export function findPublishedProduct(id: string) {
  return getPublishedProducts().find((p) => p.id === id) ?? null;
}

export const LISTINGS_UPDATED_EVENT = "navshakthi:listings-updated";

export function emitListingsUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LISTINGS_UPDATED_EVENT));
}
