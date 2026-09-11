export type CraftDNAAttributeConfidence =
  | "high"
  | "medium"
  | "low";

export type CraftDNAValueSource =
  | "image"
  | "artisan_voice"
  | "catalog"
  | "manual";

export interface CraftDNAAttribute<T = string> {
  value: T;
  confidence: number;
  source: CraftDNAValueSource;
}

export interface CraftDNA {
  version: "1.0";

  craftCategory: CraftDNAAttribute<string>;

  productType: CraftDNAAttribute<string>;

  material: CraftDNAAttribute<string>;

  primaryColour: CraftDNAAttribute<string>;

  secondaryColours: CraftDNAAttribute<string[]>;

  shape: CraftDNAAttribute<string>;

  pattern: CraftDNAAttribute<string>;

  texture: CraftDNAAttribute<string>;

  finish: CraftDNAAttribute<string>;

  decoration: CraftDNAAttribute<string>;

  complexity: CraftDNAAttribute<number>;

  size: CraftDNAAttribute<string>;

  dimensions: CraftDNAAttribute<string>;

  useCase: CraftDNAAttribute<string>;

  visualCharacteristics: string[];

  overallConfidence: number;

  createdAt: string;

  updatedAt: string;
}