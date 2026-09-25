import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

import type { CraftDNA } from "@/lib/craft-dna/types";

/* =========================================================
   TYPES
========================================================= */

type AnalyzeRequest = {
  imageDataUrl?: unknown;
};

type GeminiAnalysis = {
  craftCategory?: string;
  productType?: string;
  material?: string;
  primaryColour?: string;
  secondaryColours?: string[];
  shape?: string;
  pattern?: string;
  texture?: string;
  finish?: string;
  decoration?: string;
  complexity?: number;
  size?: string;
  dimensions?: string;
  useCase?: string;
  visualCharacteristics?: string[];
  confidence?: number;
};

/* =========================================================
   CONSTANTS
========================================================= */

const MAX_IMAGE_LENGTH =
  12 * 1024 * 1024;

const MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
] as const;

type ModelName =
  (typeof MODELS)[number];

const MAX_ATTEMPTS_PER_MODEL = 3;

const RETRY_DELAYS_MS = [
  1500,
  3000,
] as const;

const RETRYABLE_STATUS_CODES = [
  408,
  429,
  500,
  502,
  503,
  504,
] as const;

/* =========================================================
   SCHEMA
========================================================= */

const IMAGE_ANALYSIS_SCHEMA = {
  type: "object",

  properties: {
    craftCategory: {
      type: "string",
    },

    productType: {
      type: "string",
    },

    material: {
      type: "string",
    },

    primaryColour: {
      type: "string",
    },

    secondaryColours: {
      type: "array",
      items: {
        type: "string",
      },
    },

    shape: {
      type: "string",
    },

    pattern: {
      type: "string",
    },

    texture: {
      type: "string",
    },

    finish: {
      type: "string",
    },

    decoration: {
      type: "string",
    },

    complexity: {
      type: "number",
    },

    size: {
      type: "string",
    },

    dimensions: {
      type: "string",
    },

    useCase: {
      type: "string",
    },

    visualCharacteristics: {
      type: "array",
      items: {
        type: "string",
      },
    },

    confidence: {
      type: "number",
    },
  },

  required: [
    "craftCategory",
    "productType",
    "material",
    "primaryColour",
    "secondaryColours",
    "shape",
    "pattern",
    "texture",
    "finish",
    "decoration",
    "complexity",
    "size",
    "dimensions",
    "useCase",
    "visualCharacteristics",
    "confidence",
  ],
};

/* =========================================================
   HELPERS
========================================================= */

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
    return "Unknown error";
  }
}

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "Not provided";
  }

  return value.trim();
}

function cleanStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (
        item,
      ): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map(
      (item) =>
        item.trim(),
    )
    .slice(0, 10);
}

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

function normalizeConfidence(
  value: unknown,
): number {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  const normalized =
    value > 1
      ? value / 100
      : value;

  return clamp(
    normalized,
    0,
    1,
  );
}

function sleep(
  ms: number,
): Promise<void> {
  return new Promise(
    (resolve) => {
      setTimeout(
        resolve,
        ms,
      );
    },
  );
}

function getErrorStatus(
  error: unknown,
): number | null {
  if (
    typeof error === "object" &&
    error !== null
  ) {
    const candidate =
      error as {
        status?: unknown;
        statusCode?: unknown;
        code?: unknown;
        response?: {
          status?: unknown;
        };
      };

    const possibleStatuses = [
      candidate.status,
      candidate.statusCode,
      candidate.code,
      candidate.response?.status,
    ];

    for (
      const value of possibleStatuses
    ) {
      if (
        typeof value === "number" &&
        Number.isFinite(value)
      ) {
        return value;
      }

      if (
        typeof value === "string" &&
        /^\d{3}$/.test(value)
      ) {
        return Number(value);
      }
    }
  }

  const message =
    getErrorMessage(error);

  const match =
    message.match(
      /\b(408|429|500|502|503|504)\b/,
    );

  if (match) {
    return Number(match[1]);
  }

  return null;
}

function isRetryableError(
  error: unknown,
): boolean {
  const status =
    getErrorStatus(error);

  if (
    status !== null &&
    RETRYABLE_STATUS_CODES.includes(
      status as (typeof RETRYABLE_STATUS_CODES)[number],
    )
  ) {
    return true;
  }

  const message =
    getErrorMessage(
      error,
    ).toLowerCase();

  const retryableMessages = [
    "unavailable",
    "temporarily unavailable",
    "high demand",
    "overloaded",
    "resource exhausted",
    "resource_exhausted",
    "rate limit",
    "rate_limit",
    "too many requests",
    "timeout",
    "timed out",
    "deadline exceeded",
    "internal error",
    "service unavailable",
    "bad gateway",
    "gateway timeout",
  ];

  return retryableMessages.some(
    (term) =>
      message.includes(term),
  );
}

function getFailureResponse(
  error: unknown,
): {
  status: number;
  error: string;
} {
  const status =
    getErrorStatus(error);

  const message =
    getErrorMessage(
      error,
    ).toLowerCase();

  if (
    status === 429 ||
    message.includes(
      "quota",
    ) ||
    message.includes(
      "resource_exhausted",
    ) ||
    message.includes(
      "rate limit",
    )
  ) {
    return {
      status: 429,
      error:
        "Gemini API is temporarily rate-limited or quota-limited. Please try again shortly.",
    };
  }

  if (
    status === 503 ||
    message.includes(
      "unavailable",
    ) ||
    message.includes(
      "high demand",
    ) ||
    message.includes(
      "overloaded",
    )
  ) {
    return {
      status: 503,
      error:
        "Gemini image analysis is temporarily unavailable. Please try again shortly.",
    };
  }

  if (
    status === 408 ||
    status === 504 ||
    message.includes(
      "timeout",
    ) ||
    message.includes(
      "timed out",
    ) ||
    message.includes(
      "deadline exceeded",
    )
  ) {
    return {
      status: 504,
      error:
        "Gemini image analysis timed out. Please try again.",
    };
  }

  return {
    status: 500,
    error:
      "Craft DNA image analysis failed. Please try again.",
  };
}

/* =========================================================
   BUILD FULL CRAFT DNA
========================================================= */

function buildFreshCraftDNA(
  analysis: GeminiAnalysis,
): CraftDNA {
  const confidence =
    normalizeConfidence(
      analysis.confidence,
    );

  const now =
    new Date().toISOString();

  const craftCategory =
    cleanString(
      analysis.craftCategory,
    );

  const productType =
    cleanString(
      analysis.productType,
    );

  const material =
    cleanString(
      analysis.material,
    );

  const primaryColour =
    cleanString(
      analysis.primaryColour,
    );

  const secondaryColours =
    cleanStringArray(
      analysis.secondaryColours,
    );

  const shape =
    cleanString(
      analysis.shape,
    );

  const pattern =
    cleanString(
      analysis.pattern,
    );

  const texture =
    cleanString(
      analysis.texture,
    );

  const finish =
    cleanString(
      analysis.finish,
    );

  const decoration =
    cleanString(
      analysis.decoration,
    );

  const complexity =
    typeof analysis.complexity ===
      "number" &&
    Number.isFinite(
      analysis.complexity,
    )
      ? clamp(
          analysis.complexity,
          1,
          10,
        )
      : 1;

  const size =
    cleanString(
      analysis.size,
    );

  const dimensions =
    cleanString(
      analysis.dimensions,
    );

  const useCase =
    cleanString(
      analysis.useCase,
    );

  const visualCharacteristics =
    cleanStringArray(
      analysis.visualCharacteristics,
    );

  return {
    version: "1.0",

    craftCategory: {
      value:
        craftCategory,
      confidence,
      source: "image",
    },

    productType: {
      value:
        productType,
      confidence,
      source: "image",
    },

    material: {
      value:
        material,
      confidence,
      source: "image",
    },

    primaryColour: {
      value:
        primaryColour,
      confidence,
      source: "image",
    },

    secondaryColours: {
      value:
        secondaryColours,
      confidence,
      source: "image",
    },

    shape: {
      value:
        shape,
      confidence,
      source: "image",
    },

    pattern: {
      value:
        pattern,
      confidence,
      source: "image",
    },

    texture: {
      value:
        texture,
      confidence,
      source: "image",
    },

    finish: {
      value:
        finish,
      confidence,
      source: "image",
    },

    decoration: {
      value:
        decoration,
      confidence,
      source: "image",
    },

    complexity: {
      value:
        complexity,
      confidence,
      source: "image",
    },

    size: {
      value:
        size,
      confidence,
      source: "image",
    },

    dimensions: {
      value:
        dimensions,
      confidence,
      source: "image",
    },

    useCase: {
      value:
        useCase,
      confidence,
      source: "image",
    },

    visualCharacteristics,

    overallConfidence:
      confidence,

    createdAt:
      now,

    updatedAt:
      now,
  };
}

/* =========================================================
   GEMINI PROMPT
========================================================= */

function buildPrompt(): string {
  return `
You are NAVSHAKTHI Image Intelligence.

Analyze ONLY the visible craft product in the supplied image.

This image is the authoritative visual source for the
initial Craft DNA.

Your job is to extract observable visual attributes.

IMPORTANT RULES:

1. Use ONLY what is visually supported by the image.

2. Do NOT invent artisan identity.

3. Do NOT invent village, district or state.

4. Do NOT invent GI status.

5. Do NOT invent government certification.

6. Do NOT invent cultural history.

7. Do NOT claim authenticity.

8. Do NOT assume a material when it cannot be visually supported.
   If uncertain, return "Not provided".

9. Do NOT assume dimensions that cannot be visually measured.
   Return "Not provided".

10. Do NOT infer manufacturing technique unless visually evident.

11. Preserve the recognisable identity of the actual product.

12. Primary colour must describe the visible product colour,
    not the background.

13. Secondary colours must describe clearly visible additional
    product colours.

14. Texture and finish must be based on visible surface evidence.

15. Complexity must be a conservative integer from 1 to 10.

16. Confidence must represent visual evidence strength from 0 to 1.

17. If a field cannot be confidently observed, return
    "Not provided".

18. Return ONLY the structured JSON requested by the schema.

Fields:

- craftCategory
- productType
- material
- primaryColour
- secondaryColours
- shape
- pattern
- texture
- finish
- decoration
- complexity
- size
- dimensions
- useCase
- visualCharacteristics
- confidence
`.trim();
}

/* =========================================================
   GEMINI REQUEST
========================================================= */

async function analyzeWithModel({
  ai,
  model,
  mimeType,
  base64Data,
}: {
  ai: GoogleGenAI;
  model: ModelName;
  mimeType: string;
  base64Data: string;
}): Promise<{
  analysis: GeminiAnalysis;
  rawText: string;
}> {
  const response =
    await ai.models.generateContent({
      model,

      contents: [
        {
          text:
            buildPrompt(),
        },

        {
          inlineData: {
            mimeType,
            data:
              base64Data,
          },
        },
      ],

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          IMAGE_ANALYSIS_SCHEMA,

        maxOutputTokens:
          1800,
      },
    });

  const rawText =
    response.text?.trim();

  if (!rawText) {
    throw new Error(
      `${model} returned an empty response.`,
    );
  }

  let parsed:
    GeminiAnalysis;

  try {
    parsed =
      JSON.parse(
        rawText,
      ) as GeminiAnalysis;
  } catch {
    throw new Error(
      `${model} returned invalid JSON.`,
    );
  }

  return {
    analysis:
      parsed,

    rawText,
  };
}

/* =========================================================
   ROUTE
========================================================= */

export const Route =
  createFileRoute(
    "/api/craft-dna/analyze",
  )({
    server: {
      handlers: {
        POST: async ({
          request,
        }) => {
          try {
            /* =================================================
               READ REQUEST
            ================================================= */

            const body =
              (await request.json()) as AnalyzeRequest;

            const imageDataUrl =
              typeof body.imageDataUrl ===
              "string"
                ? body.imageDataUrl.trim()
                : "";

            /* =================================================
               VALIDATE IMAGE
            ================================================= */

            if (!imageDataUrl) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Enhanced image is required.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              !imageDataUrl.startsWith(
                "data:image/",
              )
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Invalid image data. Expected a data:image URL.",
                },
                {
                  status: 400,
                },
              );
            }

            if (
              imageDataUrl.length >
              MAX_IMAGE_LENGTH
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Image is too large for Craft DNA analysis.",
                },
                {
                  status: 413,
                },
              );
            }

            /* =================================================
               API KEY
            ================================================= */

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

            /* =================================================
               GEMINI CLIENT
            ================================================= */

            const ai =
              new GoogleGenAI({
                apiKey,
              });

            /* =================================================
               PARSE IMAGE DATA URL
            ================================================= */

            const commaIndex =
              imageDataUrl.indexOf(
                ",",
              );

            if (
              commaIndex === -1
            ) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Invalid image data URL.",
                },
                {
                  status: 400,
                },
              );
            }

            const header =
              imageDataUrl.slice(
                0,
                commaIndex,
              );

            const base64Data =
              imageDataUrl.slice(
                commaIndex + 1,
              );

            const mimeMatch =
              header.match(
                /^data:(image\/[^;]+);base64$/i,
              );

            if (!mimeMatch) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Invalid base64 image format.",
                },
                {
                  status: 400,
                },
              );
            }

            const mimeType =
              mimeMatch[1];

            if (!mimeType) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Image MIME type could not be determined.",
                },
                {
                  status: 400,
                },
              );
            }

            if (!base64Data) {
              return Response.json(
                {
                  success: false,
                  error:
                    "Image payload is empty.",
                },
                {
                  status: 400,
                },
              );
            }

            /* =================================================
               MODEL FALLBACK ENGINE
            ================================================= */

            let lastError:
              unknown =
              null;

            /**
             * IMPORTANT:
             * Explicit ModelName annotation fixes the
             * TypeScript literal-type assignment error.
             *
             * Without this annotation TS may infer:
             *
             * "gemini-3.8-flash"
             *
             * and then reject:
             *
             * lastModel = model
             */
            let lastModel:
              ModelName =
              MODELS[0];

            let lastStatus:
              number | null =
              null;

            for (
              const model of MODELS
            ) {
              lastModel =
                model;

              console.info(
                `[NAVSHAKTHI Craft DNA] Starting model: ${model}`,
              );

              for (
                let attempt = 1;
                attempt <=
                MAX_ATTEMPTS_PER_MODEL;
                attempt += 1
              ) {
                try {
                  console.info(
                    `[NAVSHAKTHI Craft DNA] ${model} attempt ${attempt}/${MAX_ATTEMPTS_PER_MODEL}`,
                  );

                  const result =
                    await analyzeWithModel(
                      {
                        ai,
                        model,
                        mimeType,
                        base64Data,
                      },
                    );

                  const craftDNA =
                    buildFreshCraftDNA(
                      result.analysis,
                    );

                  console.info(
                    `[NAVSHAKTHI Craft DNA] ${model} succeeded on attempt ${attempt}`,
                  );

                  return Response.json({
                    success: true,

                    craftDNA,

                    analysis:
                      result.analysis,

                    model,

                    attempts:
                      attempt,

                    timestamp:
                      new Date().toISOString(),
                  });
                } catch (
                  error
                ) {
                  lastError =
                    error;

                  const status =
                    getErrorStatus(
                      error,
                    );

                  lastStatus =
                    status;

                  const message =
                    getErrorMessage(
                      error,
                    );

                  const retryable =
                    isRetryableError(
                      error,
                    );

                  console.warn(
                    `[NAVSHAKTHI Craft DNA] ${model} attempt ${attempt} failed:`,
                    {
                      status,
                      retryable,
                      message,
                    },
                  );

                  /*
                   * Non-retryable error:
                   * stop retrying this model.
                   */
                  if (!retryable) {
                    break;
                  }

                  /*
                   * Retry same model if attempts remain.
                   */
                  if (
                    attempt <
                    MAX_ATTEMPTS_PER_MODEL
                  ) {
                    const delay =
                      RETRY_DELAYS_MS[
                        attempt - 1
                      ] ??
                      RETRY_DELAYS_MS[
                        RETRY_DELAYS_MS.length -
                          1
                      ];

                    console.info(
                      `[NAVSHAKTHI Craft DNA] Retrying ${model} in ${delay}ms`,
                    );

                    await sleep(
                      delay,
                    );
                  }
                }
              }

              /*
               * Current model exhausted.
               * Continue to next fallback model.
               */
              console.warn(
                `[NAVSHAKTHI Craft DNA] ${model} exhausted. Trying next model.`,
              );
            }

            /* =================================================
               ALL MODELS FAILED
            ================================================= */

            console.error(
              `[NAVSHAKTHI Craft DNA] All models failed.`,
              {
                lastModel,
                lastStatus,
                error:
                  getErrorMessage(
                    lastError,
                  ),
              },
            );

            const failure =
              getFailureResponse(
                lastError,
              );

            return Response.json(
              {
                success: false,

                error:
                  failure.error,

                model:
                  lastModel,

                status:
                  failure.status,

                detail:
                  getErrorMessage(
                    lastError,
                  ),
              },
              {
                status:
                  failure.status,
              },
            );
          } catch (
            error
          ) {
            /* =================================================
               UNEXPECTED SERVER ERROR
            ================================================= */

            console.error(
              "[NAVSHAKSHI Craft DNA] Unexpected route error:",
              getErrorMessage(
                error,
              ),
            );

            return Response.json(
              {
                success: false,

                error:
                  "Craft DNA image analysis failed unexpectedly. Please try again.",

                detail:
                  getErrorMessage(
                    error,
                  ),
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