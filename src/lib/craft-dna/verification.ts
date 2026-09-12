import type { CraftDNA } from "@/lib/craft-dna/types";

export type CraftDNAVerificationStatus =
  | "match"
  | "conflict"
  | "new"
  | "insufficient_evidence";

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

export type CraftDNAVerificationCheck = {
  field: CraftDNAVerificationField;
  label: string;
  status: CraftDNAVerificationStatus;
  currentValue: string;
  voiceClaim: string;
  recommendedValue: string;
  confidence: number;
  evidence: string;
};

export type CraftDNAVerificationOverallStatus =
  | "aligned"
  | "needs_review"
  | "insufficient_data";

export type CraftDNAVerificationResult = {
  overallStatus: CraftDNAVerificationOverallStatus;
  overallConfidence: number;
  summary: string;
  checks: CraftDNAVerificationCheck[];
  transcript: string;
  language: string;
  verifiedAt: string;
};

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

export const CRAFT_DNA_VERIFICATION_STORAGE_KEY =
  "navashakthi_craft_dna_verification_v1";

export const CRAFT_DNA_VERIFICATION_UPDATED_EVENT =
  "navshakthi:craft-dna-verification-updated";

export function getCraftDNAVerification():
  | CraftDNAVerificationResult
  | null {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(
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