import type { CraftDNA } from "./types";

export const CRAFT_DNA_STORAGE_KEY =
  "navshakthi_craft_dna_v1";

export const CRAFT_DNA_UPDATED_EVENT =
  "navshakthi:craft-dna-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

/**
 * Read the currently stored Craft DNA.
 */
export function getCraftDNA(): CraftDNA | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(
      CRAFT_DNA_STORAGE_KEY,
    );

    if (!raw) {
      return null;
    }

    const parsed =
      JSON.parse(raw) as CraftDNA;

    if (
      !parsed ||
      parsed.version !== "1.0"
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error(
      "NAVSHAKTHI: Failed to read Craft DNA:",
      error,
    );

    return null;
  }
}

/**
 * Save a complete Craft DNA profile.
 */
export function saveCraftDNA(
  craftDNA: CraftDNA,
): CraftDNA {
  if (!isBrowser()) {
    return craftDNA;
  }

  const now =
    new Date().toISOString();

  const updated: CraftDNA = {
    ...craftDNA,
    updatedAt: now,
  };

  try {
    localStorage.setItem(
      CRAFT_DNA_STORAGE_KEY,
      JSON.stringify(updated),
    );

    window.dispatchEvent(
      new Event(
        CRAFT_DNA_UPDATED_EVENT,
      ),
    );
  } catch (error) {
    console.error(
      "NAVSHAKTHI: Failed to save Craft DNA:",
      error,
    );
  }

  return updated;
}

/**
 * Create or update Craft DNA from
 * the existing visual-analysis result.
 */
export function upsertCraftDNA(
  craftDNA: CraftDNA,
): CraftDNA {
  const existing =
    getCraftDNA();

  if (!existing) {
    return saveCraftDNA(
      craftDNA,
    );
  }

  /*
   * Preserve the original creation
   * timestamp while replacing the
   * latest visual evidence.
   */
  return saveCraftDNA({
    ...craftDNA,
    createdAt:
      existing.createdAt ||
      craftDNA.createdAt,
  });
}

/**
 * Remove the standalone Craft DNA cache.
 *
 * This will be used when starting
 * a completely new craft workflow.
 */
export function clearCraftDNA(): void {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(
      CRAFT_DNA_STORAGE_KEY,
    );

    window.dispatchEvent(
      new Event(
        CRAFT_DNA_UPDATED_EVENT,
      ),
    );
  } catch (error) {
    console.error(
      "NAVSHAKTHI: Failed to clear Craft DNA:",
      error,
    );
  }
}

/**
 * Check whether a valid Craft DNA
 * profile currently exists.
 */
export function hasCraftDNA(): boolean {
  return getCraftDNA() !== null;
}