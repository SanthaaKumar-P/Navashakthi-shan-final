import type { CraftDNA } from "@/lib/craft-dna/types";

export type CraftLabMode =
  | "variant"
  | "design"
  | "new_product";

export type CraftExperimentStatus =
  | "idea"
  | "selected"
  | "archived";

export type CraftLabGovernmentEvent = {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  relevance?: number;
  source?: string;
};

export type CraftLabMarketContext = {
  demandDirection:
    | "increasing"
    | "stable"
    | "decreasing"
    | "insufficient_data";

  demandChange: number | null;

  opportunityScore: number;

  opportunityLevel:
    | "low"
    | "moderate"
    | "high"
    | "insufficient_data";

  seasonalityLevel:
    | "low"
    | "moderate"
    | "high"
    | "none"
    | "insufficient_data";

  productionRecommendation: string;

  threeMonth?: {
    low: number;
    central: number;
    high: number;
    changePercent: number;
  };

  sixMonth?: {
    low: number;
    central: number;
    high: number;
    changePercent: number;
  };

  governmentEvents: CraftLabGovernmentEvent[];

  dataQuality?: {
    marketReferenceAvailable: boolean;
    governmentEventsAvailable: boolean;
    tradeDataAvailable: boolean;
    odopDataAvailable: boolean;
    notes: string[];
  };

  sources?: Array<{
    label: string;
    url: string;
    type: string;
    updatedAt?: string;
  }>;
};

export type CraftExperiment = {
  id: string;

  title: string;

  mode: CraftLabMode;

  concept: string;

  rationale: string;

  retainedAttributes: string[];

  changedAttributes: string[];

  productionNotes: string[];

  marketContext?: CraftLabMarketContext;

  baseCraftDNA: CraftDNA | null;

  status: CraftExperimentStatus;

  /*
   * AI-generated visual prototype.
   *
   * Stored as a data URL so the current prototype can
   * be previewed without requiring a separate image server.
   */
  prototypeImage?: string;

  prototypeGeneratedAt?: string;

  createdAt: string;

  updatedAt: string;
};

export type CraftLabGenerationInput = {
  mode: CraftLabMode;

  craftDNA: CraftDNA | null;

  marketContext?: CraftLabMarketContext;

  artisanPrompt?: string;
};

export type CraftLabGenerationResult = {
  experiments: CraftExperiment[];

  generatedAt: string;

  marketContext?: CraftLabMarketContext;
};

export type CraftLabPrototypeInput = {
  experiment: CraftExperiment;

  craftDNA: CraftDNA;

  baseImage?: string;
};

export type CraftLabPrototypeResult = {
  imageDataUrl: string;

  generatedAt: string;
};