import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

import type {
  CraftDNAVerificationRequest,
} from "@/lib/craft-dna/verification";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type VerificationStatus =
  | "match"
  | "conflict"
  | "new"
  | "insufficient_evidence";

type VerificationCheck = {
  field: string;
  label: string;
  status: VerificationStatus;
  currentValue: string;
  voiceClaim: string;
  recommendedValue: string;
  confidence: number;
  evidence: string;
};

type VerificationResult = {
  overallStatus:
    | "aligned"
    | "needs_review"
    | "insufficient_data";
  overallConfidence: number;
  summary: string;
  checks: VerificationCheck[];
};

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const MAX_TRANSCRIPT_LENGTH = 20_000;

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
] as const;

const FIELD_DEFINITIONS = [
  {
    field: "craftCategory",
    label: "Craft Category",
  },
  {
    field: "productType",
    label: "Product Type",
  },
  {
    field: "material",
    label: "Material",
  },
  {
    field: "primaryColour",
    label: "Primary Colour",
  },
  {
    field: "secondaryColours",
    label: "Secondary Colours",
  },
  {
    field: "shape",
    label: "Shape",
  },
  {
    field: "pattern",
    label: "Pattern",
  },
  {
    field: "texture",
    label: "Texture",
  },
  {
    field: "finish",
    label: "Finish",
  },
  {
    field: "decoration",
    label: "Decoration",
  },
  {
    field: "complexity",
    label: "Complexity",
  },
  {
    field: "size",
    label: "Size",
  },
  {
    field: "dimensions",
    label: "Dimensions",
  },
  {
    field: "useCase",
    label: "Use Case",
  },
] as const;

/* -------------------------------------------------------------------------- */
/* Schema                                                                     */
/* -------------------------------------------------------------------------- */

const VERIFICATION_SCHEMA = {
  type: "object",

  properties: {
    overallStatus: {
      type: "string",
      enum: [
        "aligned",
        "needs_review",
        "insufficient_data",
      ],
    },

    overallConfidence: {
      type: "number",
    },

    summary: {
      type: "string",
    },

    checks: {
      type: "array",

      items: {
        type: "object",

        properties: {
          field: {
            type: "string",
          },

          label: {
            type: "string",
          },

          status: {
            type: "string",
            enum: [
              "match",
              "conflict",
              "new",
              "insufficient_evidence",
            ],
          },

          currentValue: {
            type: "string",
          },

          voiceClaim: {
            type: "string",
          },

          recommendedValue: {
            type: "string",
          },

          confidence: {
            type: "number",
          },

          evidence: {
            type: "string",
          },
        },

        required: [
          "field",
          "label",
          "status",
          "currentValue",
          "voiceClaim",
          "recommendedValue",
          "confidence",
          "evidence",
        ],
      },
    },
  },

  required: [
    "overallStatus",
    "overallConfidence",
    "summary",
    "checks",
  ],
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown verification error";
  }
}

function isQuotaError(
  message: string,
) {
  const lower = message.toLowerCase();

  return (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted")
  );
}

function isUnavailableError(
  message: string,
) {
  const lower = message.toLowerCase();

  return (
    message.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("high demand") ||
    lower.includes("temporarily unavailable")
  );
}

function clampConfidence(
  value: unknown,
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(
    1,
    Math.max(0, value),
  );
}

function normalizeCheck(
  raw: unknown,
  fallback: (typeof FIELD_DEFINITIONS)[number],
): VerificationCheck {
  const item =
    raw &&
    typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const allowedStatuses: VerificationStatus[] =
    [
      "match",
      "conflict",
      "new",
      "insufficient_evidence",
    ];

  const rawStatus =
    typeof item.status === "string"
      ? item.status
      : "insufficient_evidence";

  const status =
    allowedStatuses.includes(
      rawStatus as VerificationStatus,
    )
      ? (rawStatus as VerificationStatus)
      : "insufficient_evidence";

  return {
    field:
      typeof item.field === "string"
        ? item.field
        : fallback.field,

    label:
      typeof item.label === "string"
        ? item.label
        : fallback.label,

    status,

    currentValue:
      typeof item.currentValue ===
      "string"
        ? item.currentValue
        : "Not provided",

    voiceClaim:
      typeof item.voiceClaim === "string"
        ? item.voiceClaim
        : "Not mentioned",

    recommendedValue:
      typeof item.recommendedValue ===
      "string"
        ? item.recommendedValue
        : "Not provided",

    confidence:
      clampConfidence(
        item.confidence,
      ),

    evidence:
      typeof item.evidence === "string"
        ? item.evidence
        : "No explicit evidence found.",
  };
}

function normalizeResult(
  raw: unknown,
): VerificationResult {
  const value =
    raw &&
    typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const rawChecks = Array.isArray(
    value.checks,
  )
    ? value.checks
    : [];

  const checks =
    FIELD_DEFINITIONS.map(
      (definition) => {
        const found = rawChecks.find(
          (item) =>
            item &&
            typeof item === "object" &&
            (item as Record<string, unknown>)
              .field ===
              definition.field,
        );

        return normalizeCheck(
          found,
          definition,
        );
      },
    );

  const rawOverallStatus =
    typeof value.overallStatus ===
    "string"
      ? value.overallStatus
      : "insufficient_data";

  const overallStatus =
    rawOverallStatus === "aligned" ||
    rawOverallStatus ===
      "needs_review" ||
    rawOverallStatus ===
      "insufficient_data"
      ? rawOverallStatus
      : "insufficient_data";

  return {
    overallStatus,

    overallConfidence:
      clampConfidence(
        value.overallConfidence,
      ),

    summary:
      typeof value.summary === "string"
        ? value.summary
        : "Verification completed.",

    checks,
  };
}

/* -------------------------------------------------------------------------- */
/* Prompt                                                                     */
/* -------------------------------------------------------------------------- */

function buildPrompt(
  body: CraftDNAVerificationRequest,
) {
  const dna = body.craftDNA;

  return `
You are NAVSHAKTHI's Craft DNA Voice Re-verification AI.

Your task is NOT to create a marketplace listing.

Your task is to compare an EXISTING structured Craft DNA profile
against an ARTISAN'S OWN VOICE TRANSCRIPT.

The purpose is evidence-based re-verification.

=========================================================
EXISTING CRAFT DNA
=========================================================

Craft Category:
${dna.craftCategory}

Product Type:
${dna.productType}

Material:
${dna.material}

Primary Colour:
${dna.primaryColour}

Secondary Colours:
${dna.secondaryColours.join(", ") || "Not provided"}

Shape:
${dna.shape}

Pattern:
${dna.pattern}

Texture:
${dna.texture}

Finish:
${dna.finish}

Decoration:
${dna.decoration}

Complexity:
${dna.complexity}

Size:
${dna.size}

Dimensions:
${dna.dimensions}

Use Case:
${dna.useCase}

=========================================================
ARTISAN VOICE
=========================================================

Language:
${body.language || "Auto detected"}

Transcript:
"""
${body.transcript}
"""

=========================================================
CORE EVIDENCE RULES
=========================================================

The transcript is the ONLY source of voice evidence.

Do NOT invent facts.

Do NOT infer facts that are not explicitly supported.

Do NOT treat professional wording as evidence.

Do NOT assume traditional techniques.

Do NOT assume materials.

Do NOT assume colours.

Do NOT assume dimensions.

Do NOT assume certification.

Do NOT assume GI status.

Do NOT assume government approval.

Do NOT assume origin unless explicitly stated.

Do NOT assume authenticity.

=========================================================
STATUS DEFINITIONS
=========================================================

For every field:

"match"
- The artisan explicitly supports the existing DNA value.
- Equivalent wording is acceptable.

"conflict"
- The artisan explicitly states something inconsistent
  with the existing DNA value.

"new"
- The existing DNA is missing / "Not provided",
  but the artisan explicitly provides a value.

"insufficient_evidence"
- The transcript does not provide enough explicit evidence
  to verify or change the field.

=========================================================
RECOMMENDED VALUE
=========================================================

For MATCH:
Return the existing value.

For CONFLICT:
Return the explicitly stated artisan value.

For NEW:
Return the explicitly stated artisan value.

For INSUFFICIENT_EVIDENCE:
Return "Not provided".

Never create a recommendation from inference.

=========================================================
COMPLEXITY
=========================================================

Complexity is only a numeric field if the artisan explicitly
states a complexity/detail score.

If the artisan describes the craft as "very detailed" or
"complex" without a numeric score, do NOT invent a number.

Return "Not provided" unless an explicit numeric value exists.

=========================================================
OVERALL STATUS
=========================================================

"aligned":
No meaningful conflicts and enough evidence exists.

"needs_review":
At least one meaningful conflict exists.

"insufficient_data":
The transcript contains too little useful information
to verify the profile.

=========================================================
CONFIDENCE
=========================================================

Return confidence between 0 and 1.

Confidence represents the strength of the transcript evidence.

Do NOT make confidence high merely because the transcript
sounds fluent.

=========================================================
FINAL RULE
=========================================================

Return ONLY valid JSON matching the provided schema.
`;
}

/* -------------------------------------------------------------------------- */
/* Gemini call                                                                */
/* -------------------------------------------------------------------------- */

async function verifyWithModel(
  ai: GoogleGenAI,
  model: string,
  body: CraftDNAVerificationRequest,
) {
  const response =
    await ai.models.generateContent({
      model,

      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildPrompt(body),
            },
          ],
        },
      ],

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          VERIFICATION_SCHEMA,

        maxOutputTokens: 5000,
      },
    });

  const rawText =
    response.text?.trim() ?? "";

  if (!rawText) {
    throw new Error(
      `${model} returned an empty verification response.`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      `${model} returned invalid verification JSON.`,
    );
  }

  return normalizeResult(parsed);
}

/* -------------------------------------------------------------------------- */
/* Route                                                                      */
/* -------------------------------------------------------------------------- */

export const Route = createFileRoute(
  "/api/craft-dna/verify",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body =
            (await request.json()) as Partial<CraftDNAVerificationRequest>;

          const transcript =
            typeof body.transcript ===
            "string"
              ? body.transcript.trim()
              : "";

          if (!transcript) {
            return Response.json(
              {
                success: false,
                error:
                  "Transcript is required.",
              },
              {
                status: 400,
              },
            );
          }

          if (
            transcript.length >
            MAX_TRANSCRIPT_LENGTH
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Transcript is too long. Maximum length is 20,000 characters.",
              },
              {
                status: 413,
              },
            );
          }

          if (
            !body.craftDNA ||
            typeof body.craftDNA !==
              "object"
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Existing Craft DNA is required.",
              },
              {
                status: 400,
              },
            );
          }

          const apiKey =
            process.env.GEMINI_API_KEY;

          if (!apiKey) {
            return Response.json(
              {
                success: false,
                error:
                  "GEMINI_API_KEY is not configured on the server.",
              },
              {
                status: 500,
              },
            );
          }

          const ai =
            new GoogleGenAI({
              apiKey,
            });

          const verificationBody: CraftDNAVerificationRequest =
            {
              transcript,
              language:
                typeof body.language ===
                "string"
                  ? body.language
                  : "auto",
              craftDNA:
                body.craftDNA,
            };

          let lastError: unknown =
            null;

          for (
            let index = 0;
            index < MODELS.length;
            index += 1
          ) {
            const model =
              MODELS[index];

            try {
              const result =
                await verifyWithModel(
                  ai,
                  model,
                  verificationBody,
                );

              return Response.json({
                success: true,
                result,
                model,
              });
            } catch (error) {
              lastError = error;

              const message =
                getErrorMessage(error);

              console.warn(
                `[Craft DNA Verification] ${model} failed:`,
                message,
              );

              if (
                isQuotaError(message)
              ) {
                return Response.json(
                  {
                    success: false,
                    error:
                      "Gemini API quota has been reached. Please use another Gemini API project/key or wait for the quota to reset.",
                  },
                  {
                    status: 429,
                  },
                );
              }

              if (
                isUnavailableError(
                  message,
                )
              ) {
                continue;
              }

              break;
            }
          }

          const finalMessage =
            getErrorMessage(
              lastError,
            );

          return Response.json(
            {
              success: false,
              error:
                `Craft DNA verification failed: ${finalMessage}`,
            },
            {
              status: isUnavailableError(
                finalMessage,
              )
                ? 503
                : 500,
            },
          );
        } catch (error) {
          const message =
            getErrorMessage(error);

          return Response.json(
            {
              success: false,
              error:
                `Craft DNA verification failed: ${message}`,
            },
            {
              status: 500,
            },
          );
        }
      },
    },
  },
});