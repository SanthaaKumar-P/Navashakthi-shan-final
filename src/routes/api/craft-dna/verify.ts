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
  ["craftCategory", "Craft Category"],
  ["productType", "Product Type"],
  ["material", "Material"],
  ["primaryColour", "Primary Colour"],
  ["secondaryColours", "Secondary Colours"],
  ["shape", "Shape"],
  ["pattern", "Pattern"],
  ["texture", "Texture"],
  ["finish", "Finish"],
  ["decoration", "Decoration"],
  ["complexity", "Complexity"],
  ["size", "Size"],
  ["dimensions", "Dimensions"],
  ["useCase", "Use Case"],
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

function getErrorMessage(error: unknown): string {
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

function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("resource_exhausted")
  );
}

function isUnavailableError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    message.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("overloaded") ||
    lower.includes("high demand") ||
    lower.includes("temporarily unavailable")
  );
}

function clampConfidence(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function normalizeCheck(
  raw: unknown,
  fallback: {
    field: string;
    label: string;
  },
): VerificationCheck {
  const item =
    raw &&
    typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : {};

  const allowedStatuses: VerificationStatus[] = [
    "match",
    "conflict",
    "new",
    "insufficient_evidence",
  ];

  const rawStatus =
    typeof item.status === "string"
      ? item.status
      : "insufficient_evidence";

  const status = allowedStatuses.includes(
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
      typeof item.currentValue === "string"
        ? item.currentValue
        : "Not provided",

    voiceClaim:
      typeof item.voiceClaim === "string"
        ? item.voiceClaim
        : "Not mentioned",

    recommendedValue:
      typeof item.recommendedValue === "string"
        ? item.recommendedValue
        : "Not provided",

    confidence: clampConfidence(
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

  const rawChecks = Array.isArray(value.checks)
    ? value.checks
    : [];

  const checks = FIELD_DEFINITIONS.map(
    ([field, label]) => {
      const found = rawChecks.find(
        (item) =>
          item &&
          typeof item === "object" &&
          (item as Record<string, unknown>)
            .field === field,
      );

      return normalizeCheck(found, {
        field,
        label,
      });
    },
  );

  const rawOverallStatus =
    typeof value.overallStatus === "string"
      ? value.overallStatus
      : "insufficient_data";

  const overallStatus =
    rawOverallStatus === "aligned" ||
    rawOverallStatus === "needs_review" ||
    rawOverallStatus === "insufficient_data"
      ? rawOverallStatus
      : "insufficient_data";

  return {
    overallStatus,

    overallConfidence: clampConfidence(
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
): string {
  const dna = body.craftDNA;

  return `
You are NAVSHAKTHI's Craft DNA Voice Re-verification AI.

IMPORTANT SOURCE-OF-TRUTH RULE:

The EXISTING CRAFT DNA supplied below was derived from
IMAGE INTELLIGENCE.

Therefore:

IMAGE-DERIVED CRAFT DNA = VISUAL BASELINE
ARTISAN VOICE = VERIFICATION / ADDITIONAL EVIDENCE

The voice transcript must NEVER automatically replace the
image-derived Craft DNA.

Your task is ONLY to compare the artisan's explicit spoken
claims against the existing image-derived Craft DNA.

Do NOT create a new visual identity from the transcript.

Do NOT modify Craft DNA.

Do NOT automatically accept voice claims.

A conflict must be surfaced for human/artisan review.

=========================================================
EXISTING IMAGE-DERIVED CRAFT DNA
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
ARTISAN VOICE TRANSCRIPT
=========================================================

Language:
${body.language || "Auto detected"}

Transcript:
"""
${body.transcript}
"""

=========================================================
EVIDENCE RULES
=========================================================

The transcript is ONLY a source of artisan statements.

Only explicit statements in the transcript are evidence.

Do NOT infer facts.

Do NOT guess.

Do NOT use general knowledge to fill missing information.

Do NOT assume traditional techniques.

Do NOT assume materials.

Do NOT assume colours.

Do NOT assume dimensions.

Do NOT assume certification.

Do NOT assume GI status.

Do NOT assume government approval.

Do NOT assume authenticity.

Do NOT assume origin.

Do NOT assume proof of provenance.

=========================================================
STATUS DEFINITIONS
=========================================================

MATCH:

Use "match" when the artisan explicitly confirms or states
a value equivalent to the existing Craft DNA value.

CONFLICT:

Use "conflict" when the artisan explicitly states a value
that conflicts with the existing Craft DNA.

NEW:

Use "new" when the existing Craft DNA value is missing or
"Not provided" and the artisan explicitly supplies a value.

INSUFFICIENT_EVIDENCE:

Use "insufficient_evidence" when the artisan does not
explicitly provide enough information for that field.

=========================================================
RECOMMENDED VALUE
=========================================================

MATCH:
Return the existing Craft DNA value.

CONFLICT:
Return ONLY the explicitly stated artisan value.

NEW:
Return ONLY the explicitly stated artisan value.

INSUFFICIENT_EVIDENCE:
Return "Not provided".

Never infer a recommended value.

=========================================================
VISUAL ATTRIBUTE RULE
=========================================================

For visual attributes such as:

- material
- colour
- shape
- pattern
- texture
- finish
- decoration

the existing image-derived Craft DNA remains the visual
baseline.

If the artisan says something different, report CONFLICT.

Do not silently replace the image-derived value.

=========================================================
COMPLEXITY RULE
=========================================================

Complexity must remain "Not provided" unless the artisan
explicitly provides a numeric complexity/detail score.

Words such as:

"very detailed"
"complex"
"highly intricate"

are not numeric evidence.

Do not invent a number.

=========================================================
OVERALL STATUS
=========================================================

Use "aligned" when there are no meaningful conflicts.

Use "needs_review" when at least one meaningful conflict
or new evidence requires artisan review.

Use "insufficient_data" when the transcript contains too
little useful evidence to perform meaningful verification.

=========================================================
CONFIDENCE
=========================================================

Return a value between 0 and 1.

Confidence measures explicit evidence strength.

Do not give high confidence merely because the transcript
is fluent or grammatically correct.

=========================================================
FINAL RULE
=========================================================

Return ONLY valid JSON matching the provided schema.
`;
}

/* -------------------------------------------------------------------------- */
/* Gemini                                                                     */
/* -------------------------------------------------------------------------- */

async function verifyWithModel(
  ai: GoogleGenAI,
  model: string,
  body: CraftDNAVerificationRequest,
): Promise<VerificationResult> {
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
        responseMimeType: "application/json",
        responseSchema: VERIFICATION_SCHEMA,
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
            typeof body.transcript === "string"
              ? body.transcript.trim()
              : "";

          if (!transcript) {
            return Response.json(
              {
                success: false,
                error: "Transcript is required.",
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
            typeof body.craftDNA !== "object"
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Existing image-derived Craft DNA is required.",
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

          const ai = new GoogleGenAI({
            apiKey,
          });

          const verificationBody: CraftDNAVerificationRequest =
            {
              transcript,
              language:
                typeof body.language === "string"
                  ? body.language
                  : "auto",
              craftDNA: body.craftDNA,
            };

          let lastError: unknown = null;

          for (const model of MODELS) {
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

              if (isQuotaError(message)) {
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

              if (isUnavailableError(message)) {
                continue;
              }

              break;
            }
          }

          const finalMessage =
            getErrorMessage(lastError);

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