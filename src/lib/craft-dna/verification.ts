import type { CraftDNA } from "@/lib/craft-dna/types";

/**
 * Result of comparing one Craft DNA field
 * against the artisan's spoken evidence.
 */
export type CraftDNAVerificationStatus =
  | "match"
  | "conflict"
  | "new"
  | "insufficient_evidence";

/**
 * Craft DNA fields that can be re-verified
 * using artisan voice evidence.
 */
export type CraftDNAVerificationField =
  | "craftCategory"
  | "productType"
  | "material"
  | "primaryColour"
  | "secondaryColours"
  | "shape"
  | "pattern"
  | "texture"
  | "finish"
  | "decoration"
  | "complexity"
  | "size"
  | "dimensions"
  | "useCase";

/**
 * Field-level verification result.
 */
export type CraftDNAVerificationCheck = {
  field: CraftDNAVerificationField;

  label: string;

  status: CraftDNAVerificationStatus;

  /**
   * Value currently stored in Craft DNA.
   */
  currentValue: string;

  /**
   * Evidence extracted from artisan voice.
   */
  voiceClaim: string;

  /**
   * Value that may be applied after
   * explicit artisan review.
   */
  recommendedValue: string;

  /**
   * Confidence from 0 to 1.
   */
  confidence: number;

  /**
   * Short explanation of why the
   * verification engine reached this result.
   */
  evidence: string;
};

/**
 * Overall verification state.
 */
export type CraftDNAVerificationOverallStatus =
  | "aligned"
  | "needs_review"
  | "insufficient_data";

/**
 * Complete voice verification result.
 */
export type CraftDNAVerificationResult = {
  overallStatus: CraftDNAVerificationOverallStatus;

  /**
   * Overall confidence from 0 to 1.
   */
  overallConfidence: number;

  /**
   * Human-readable verification summary.
   */
  summary: string;

  /**
   * Field-by-field comparison results.
   */
  checks: CraftDNAVerificationCheck[];

  /**
   * Original artisan transcript.
   */
  transcript: string;

  /**
   * Language used/detected for the transcript.
   */
  language: string;

  /**
   * ISO timestamp.
   */
  verifiedAt: string;
};

/**
 * Request sent to the Craft DNA verification API.
 */
export type CraftDNAVerificationRequest = {
  transcript: string;

  language?: string;

  craftDNA: {
    craftCategory: string;
    productType: string;
    material: string;
    primaryColour: string;
    secondaryColours: string[];
    shape: string;
    pattern: string;
    texture: string;
    finish: string;
    decoration: string;
    complexity: number;
    size: string;
    dimensions: string;
    useCase: string;
  };
};

/**
 * LocalStorage key for the latest verification result.
 */
export const CRAFT_DNA_VERIFICATION_STORAGE_KEY =
  "navashakthi_craft_dna_verification_v1";

/**
 * Browser event fired whenever verification
 * data is saved or cleared.
 */
export const CRAFT_DNA_VERIFICATION_UPDATED_EVENT =
  "navshakthi:craft-dna-verification-updated";

/**
 * Get the most recent Craft DNA voice verification.
 */
export function getCraftDNAVerification():
  | CraftDNAVerificationResult
  | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw =
      window.localStorage.getItem(
        CRAFT_DNA_VERIFICATION_STORAGE_KEY,
      );

    if (!raw) {
      return null;
    }

    return JSON.parse(
      raw,
    ) as CraftDNAVerificationResult;
  } catch {
    return null;
  }
}

/**
 * Save the latest Craft DNA voice verification.
 */
export function saveCraftDNAVerification(
  result: CraftDNAVerificationResult,
) {
  if (
    typeof window === "undefined"
  ) {
    return result;
  }

  window.localStorage.setItem(
    CRAFT_DNA_VERIFICATION_STORAGE_KEY,
    JSON.stringify(result),
  );

  window.dispatchEvent(
    new Event(
      CRAFT_DNA_VERIFICATION_UPDATED_EVENT,
    ),
  );

  return result;
}

/**
 * Clear the stored verification result.
 */
export function clearCraftDNAVerification() {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.localStorage.removeItem(
    CRAFT_DNA_VERIFICATION_STORAGE_KEY,
  );

  window.dispatchEvent(
    new Event(
      CRAFT_DNA_VERIFICATION_UPDATED_EVENT,
    ),
  );
}

/**
 * Convert a Craft DNA field into the
 * string representation expected by
 * the verification API/UI.
 */
export function getVerificationValue(
  dna: CraftDNA,
  field: CraftDNAVerificationField,
): string {
  switch (field) {
    case "craftCategory":
      return dna.craftCategory.value;

    case "productType":
      return dna.productType.value;

    case "material":
      return dna.material.value;

    case "primaryColour":
      return dna.primaryColour.value;

    case "secondaryColours":
      return dna.secondaryColours.value.join(
        ", ",
      );

    case "shape":
      return dna.shape.value;

    case "pattern":
      return dna.pattern.value;

    case "texture":
      return dna.texture.value;

    case "finish":
      return dna.finish.value;

    case "decoration":
      return dna.decoration.value;

    case "complexity":
      return String(
        dna.complexity.value,
      );

    case "size":
      return dna.size.value;

    case "dimensions":
      return dna.dimensions.value;

    case "useCase":
      return dna.useCase.value;

    default:
      return "Not provided";
  }
}