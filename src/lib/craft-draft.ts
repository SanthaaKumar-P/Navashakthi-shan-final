export type CraftImageDraft = {
  originalImage: string | null;
  enhancedImage: string | null;
  imageScore: { sharpness: number; exposure: number; contrast: number } | null;
  afterImageScore: { sharpness: number; exposure: number; contrast: number } | null;
  backgroundRemovedPercent: number;
};

export type CraftCatalogDraft = {
  detectedLanguage: string;
  transcript: string;
  product: Record<string, string>;
  english: { title: string; description: string; metaDescription: string; altText: string };
  hindi: { title: string; description: string; metaDescription: string; altText: string };
  seoKeywords: string[];
  hashtags: string[];
  confidence: number;
};

export type CraftPricingDraft = {
  materialCost: number;
  labourBenchmark: number;
  estimatedLabourCost: number;
  packaging: number;
  overhead: number;
  sustainableFloor: number;
  marketBenchmark: number;
  recommended: number;
  low: number;
  high: number;
  confidence: number;
  market: {
    low: number;
    median: number;
    high: number;
    demandChange: number;
    comparableCount: number;
    matchLabel: string;
    sourceType: "curated_reference" | "official_reference";
    sourceLabel: string;
    updatedAt: string;
    materialCostReference: number;
    labourBenchmark: number;
  } | null;
};

export type CraftDraft = {
  id: string;
  image: CraftImageDraft | null;
  catalog: CraftCatalogDraft | null;
  pricing: CraftPricingDraft | null;

  /**
   * The actual customer-facing selling price chosen by the artisan.
   * AI pricing is advisory only and must never populate this automatically.
   */
  finalSellingPrice: number | null;

  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
};

export const CRAFT_DRAFT_STORAGE_KEY = "navshakthi_craft_draft_v1";
export const ARTISAN_LISTINGS_STORAGE_KEY = "navshakthi_artisan_listings_v1";

function isBrowser() {
  return typeof window !== "undefined";
}

function createEmptyDraft(): CraftDraft {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    image: null,
    catalog: null,
    pricing: null,
    finalSellingPrice: null,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function getCraftDraft(): CraftDraft | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(CRAFT_DRAFT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<CraftDraft>;

    // Backward-compatible migration for drafts created before manual pricing.
    return {
      ...parsed,
      id: parsed.id ?? crypto.randomUUID(),
      image: parsed.image ?? null,
      catalog: parsed.catalog ?? null,
      pricing: parsed.pricing ?? null,
      finalSellingPrice:
        typeof parsed.finalSellingPrice === "number" && parsed.finalSellingPrice > 0
          ? parsed.finalSellingPrice
          : null,
      status: parsed.status ?? "draft",
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    } as CraftDraft;
  } catch (error) {
    console.error("Failed to read craft draft:", error);
    return null;
  }
}

export function getOrCreateCraftDraft(): CraftDraft {
  const existing = getCraftDraft();
  if (existing) return existing;

  const draft = createEmptyDraft();
  if (isBrowser()) {
    localStorage.setItem(CRAFT_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }
  return draft;
}

export function saveCraftDraft(updates: Partial<CraftDraft>): CraftDraft {
  const current = getOrCreateCraftDraft();

  const updated: CraftDraft = {
    ...current,
    ...updates,
    image: updates.image !== undefined ? updates.image : current.image,
    catalog: updates.catalog !== undefined ? updates.catalog : current.catalog,
    pricing: updates.pricing !== undefined ? updates.pricing : current.pricing,
    finalSellingPrice:
      updates.finalSellingPrice !== undefined
        ? updates.finalSellingPrice
        : current.finalSellingPrice,
    updatedAt: new Date().toISOString(),
  };

  if (isBrowser()) {
    localStorage.setItem(CRAFT_DRAFT_STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
}

export function saveCraftImage(image: CraftImageDraft): CraftDraft {
  return saveCraftDraft({ image });
}

export function saveCraftCatalog(catalog: CraftCatalogDraft): CraftDraft {
  return saveCraftDraft({ catalog });
}

export function saveCraftPricing(pricing: CraftPricingDraft): CraftDraft {
  return saveCraftDraft({ pricing });
}

/** Save only the artisan-selected customer-facing selling price. */
export function saveFinalSellingPrice(price: number | null): CraftDraft {
  const normalized =
    typeof price === "number" && Number.isFinite(price) && price > 0
      ? Math.round(price)
      : null;

  return saveCraftDraft({ finalSellingPrice: normalized });
}

export function clearCraftDraft() {
  if (!isBrowser()) return;
  localStorage.removeItem(CRAFT_DRAFT_STORAGE_KEY);
}

export function getArtisanListings(): CraftDraft[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(ARTISAN_LISTINGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CraftDraft[];
  } catch (error) {
    console.error("Failed to read artisan listings:", error);
    return [];
  }
}

export function publishCraftDraft(): CraftDraft | null {
  if (!isBrowser()) return null;

  const draft = getCraftDraft();
  if (!draft) return null;

  // Never publish an AI recommendation as the selling price.
  if (!draft.finalSellingPrice || draft.finalSellingPrice <= 0) {
    console.error("Cannot publish craft: artisan selling price is missing.");
    return null;
  }

  const published: CraftDraft = {
    ...draft,
    status: "published",
    updatedAt: new Date().toISOString(),
  };

  const listings = getArtisanListings();
  const existingIndex = listings.findIndex((item) => item.id === published.id);

  if (existingIndex >= 0) listings[existingIndex] = published;
  else listings.unshift(published);

  localStorage.setItem(ARTISAN_LISTINGS_STORAGE_KEY, JSON.stringify(listings));

  window.dispatchEvent(new Event("navshakthi:craft-published"));
  localStorage.removeItem(CRAFT_DRAFT_STORAGE_KEY);

  return published;
}

export function deleteArtisanListing(id: string) {
  if (!isBrowser()) return;

  const listings = getArtisanListings().filter((item) => item.id !== id);
  localStorage.setItem(ARTISAN_LISTINGS_STORAGE_KEY, JSON.stringify(listings));
}
