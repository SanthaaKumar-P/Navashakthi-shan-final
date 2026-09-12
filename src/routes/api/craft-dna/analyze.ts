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
) {
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
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  /*
   * Accept both:
   *
   * 0.95
   * and
   * 95
   */
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

function buildPrompt() {
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
            const body =
              (await request.json()) as AnalyzeRequest;

            const imageDataUrl =
              typeof body.imageDataUrl ===
              "string"
                ? body.imageDataUrl.trim()
                : "";

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

            let lastError:
              unknown =
              null;

            for (
              const model of MODELS
            ) {
              try {
                const response =
                  await ai.models.generateContent(
                    {
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
                    },
                  );

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

                const craftDNA =
                  buildFreshCraftDNA(
                    parsed,
                  );

                return Response.json({
                  success: true,

                  craftDNA,

                  analysis:
                    parsed,

                  model,
                });
              } catch (
                error
              ) {
                lastError =
                  error;

                console.warn(
                  `[NAVSHAKSHI Craft DNA] ${model} failed:`,
                  getErrorMessage(
                    error,
                  ),
                );

                const message =
                  getErrorMessage(
                    error,
                  ).toLowerCase();

                if (
                  message.includes(
                    "429",
                  ) ||
                  message.includes(
                    "quota",
                  ) ||
                  message.includes(
                    "resource_exhausted",
                  )
                ) {
                  return Response.json(
                    {
                      success: false,
                      error:
                        "Gemini API quota has been reached.",
                    },
                    {
                      status: 429,
                    },
                  );
                }

                if (
                  message.includes(
                    "503",
                  ) ||
                  message.includes(
                    "unavailable",
                  ) ||
                  message.includes(
                    "overloaded",
                  ) ||
                  message.includes(
                    "high demand",
                  )
                ) {
                  continue;
                }

                break;
              }
            }

            return Response.json(
              {
                success: false,
                error:
                  `Craft DNA image analysis failed: ${getErrorMessage(
                    lastError,
                  )}`,
              },
              {
                status: 500,
              },
            );
          } catch (
            error
          ) {
            return Response.json(
              {
                success: false,
                error:
                  `Craft DNA image analysis failed: ${getErrorMessage(
                    error,
                  )}`,
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