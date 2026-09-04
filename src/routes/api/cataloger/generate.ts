import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

/* =========================================================
 * TYPES
 * ========================================================= */

type CatalogProduct = {
  name: string;
  category: string;
  material: string;
  technique: string;
  finish: string;
  color: string;
  design: string;
  size: string;
  weight: string;
  capacity: string;
  origin: string;
  craftTradition: string;
  usage: string;
  care: string;
  customization: string;
};

type CatalogListing = {
  title: string;
  description: string;
  metaDescription: string;
  altText: string;
};

type CatalogResult = {
  detectedLanguage: string;

  product: CatalogProduct;

  english: CatalogListing;

  hindi: CatalogListing;

  seoKeywords: string[];

  hashtags: string[];

  confidence: number;
};

/* =========================================================
 * VALIDATION
 * ========================================================= */

const MAX_TRANSCRIPT_LENGTH = 20_000;

const MISSING = "Not provided";

/* =========================================================
 * STRUCTURED OUTPUT SCHEMA
 * ========================================================= */

const CATALOG_SCHEMA = {
  type: "object",

  properties: {
    detectedLanguage: {
      type: "string",
      description:
        "Detected language of the artisan voice transcript.",
    },

    product: {
      type: "object",

      properties: {
        name: {
          type: "string",
        },

        category: {
          type: "string",
        },

        material: {
          type: "string",
        },

        technique: {
          type: "string",
        },

        finish: {
          type: "string",
        },

        color: {
          type: "string",
        },

        design: {
          type: "string",
        },

        size: {
          type: "string",
        },

        weight: {
          type: "string",
        },

        capacity: {
          type: "string",
        },

        origin: {
          type: "string",
        },

        craftTradition: {
          type: "string",
        },

        usage: {
          type: "string",
        },

        care: {
          type: "string",
        },

        customization: {
          type: "string",
        },
      },

      required: [
        "name",
        "category",
        "material",
        "technique",
        "finish",
        "color",
        "design",
        "size",
        "weight",
        "capacity",
        "origin",
        "craftTradition",
        "usage",
        "care",
        "customization",
      ],
    },

    english: {
      type: "object",

      properties: {
        title: {
          type: "string",
        },

        description: {
          type: "string",
        },

        metaDescription: {
          type: "string",
        },

        altText: {
          type: "string",
        },
      },

      required: [
        "title",
        "description",
        "metaDescription",
        "altText",
      ],
    },

    hindi: {
      type: "object",

      properties: {
        title: {
          type: "string",
        },

        description: {
          type: "string",
        },

        metaDescription: {
          type: "string",
        },

        altText: {
          type: "string",
        },
      },

      required: [
        "title",
        "description",
        "metaDescription",
        "altText",
      ],
    },

    seoKeywords: {
      type: "array",

      items: {
        type: "string",
      },
    },

    hashtags: {
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
    "detectedLanguage",
    "product",
    "english",
    "hindi",
    "seoKeywords",
    "hashtags",
    "confidence",
  ],
};

/* =========================================================
 * HELPERS
 * ========================================================= */

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
    return "Unknown catalog generation error";
  }
}

function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    message.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quotafailure") ||
    lower.includes("quota")
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

function asString(value: unknown): string {
  if (typeof value !== "string") {
    return MISSING;
  }

  const trimmed = value.trim();

  return trimmed || MISSING;
}

function asStringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is string =>
        typeof item === "string",
    )
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeListing(
  value: unknown,
): CatalogListing {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      title: MISSING,
      description: MISSING,
      metaDescription: MISSING,
      altText: MISSING,
    };
  }

  const item =
    value as Record<string, unknown>;

  return {
    title: asString(item.title),
    description: asString(item.description),
    metaDescription: asString(
      item.metaDescription,
    ),
    altText: asString(item.altText),
  };
}

function normalizeProduct(
  value: unknown,
): CatalogProduct {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return {
      name: MISSING,
      category: MISSING,
      material: MISSING,
      technique: MISSING,
      finish: MISSING,
      color: MISSING,
      design: MISSING,
      size: MISSING,
      weight: MISSING,
      capacity: MISSING,
      origin: MISSING,
      craftTradition: MISSING,
      usage: MISSING,
      care: MISSING,
      customization: MISSING,
    };
  }

  const item =
    value as Record<string, unknown>;

  return {
    name: asString(item.name),
    category: asString(item.category),
    material: asString(item.material),
    technique: asString(item.technique),
    finish: asString(item.finish),
    color: asString(item.color),
    design: asString(item.design),
    size: asString(item.size),
    weight: asString(item.weight),
    capacity: asString(item.capacity),
    origin: asString(item.origin),
    craftTradition: asString(
      item.craftTradition,
    ),
    usage: asString(item.usage),
    care: asString(item.care),
    customization: asString(
      item.customization,
    ),
  };
}

function normalizeCatalogResult(
  raw: unknown,
): CatalogResult {
  if (
    !raw ||
    typeof raw !== "object"
  ) {
    throw new Error(
      "Gemini returned an invalid catalog structure.",
    );
  }

  const result =
    raw as Record<string, unknown>;

  const rawConfidence =
    typeof result.confidence === "number"
      ? result.confidence
      : 0.5;

  const confidence = Math.max(
    0,
    Math.min(1, rawConfidence),
  );

  return {
    detectedLanguage: asString(
      result.detectedLanguage,
    ),

    product: normalizeProduct(
      result.product,
    ),

    english: normalizeListing(
      result.english,
    ),

    hindi: normalizeListing(
      result.hindi,
    ),

    seoKeywords: asStringArray(
      result.seoKeywords,
    ),

    hashtags: asStringArray(
      result.hashtags,
    ),

    confidence,
  };
}

/* =========================================================
 * PROMPT
 * ========================================================= */

function buildPrompt(
  transcript: string,
  language: string,
): string {
  return `
You are NAVSHAKTHI's multilingual artisan marketplace cataloging AI.

Your job is to convert an artisan's voice-note transcript into a professional marketplace-ready product listing.

SOURCE LANGUAGE:
${language || "Auto detected"}

ARTISAN TRANSCRIPT:
"""
${transcript}
"""

IMPORTANT SOURCE-OF-TRUTH RULE:

The transcript is the ONLY source of product facts.

Never invent information.

If a product attribute is not explicitly stated in the transcript, return:

"Not provided"

Do NOT infer missing facts.

Do NOT assume the material.

Do NOT assume the craft technique.

Do NOT assume the location.

Do NOT assume the size.

Do NOT assume weight.

Do NOT assume capacity.

Do NOT assume certification.

Do NOT assume GI status.

Do NOT assume organic status.

Do NOT assume eco-friendly status.

Do NOT assume chemical-free status.

Do NOT assume food-safe status.

Do NOT assume handmade status unless the transcript supports it.

Do NOT assume production time.

Do NOT assume price.

Do NOT assume availability.

Do NOT add exaggerated marketing claims.

=========================================================
PRODUCT ATTRIBUTE EXTRACTION
=========================================================

Extract these attributes only when supported:

- product name
- category
- material
- technique
- finish
- color
- design
- size
- weight
- capacity
- origin
- craft tradition
- usage
- care
- customization

Missing attributes MUST be:

"Not provided"

=========================================================
ENGLISH MARKETPLACE LISTING
=========================================================

Generate:

1. Professional SEO-friendly product title.
2. Natural marketplace description.
3. Short meta description.
4. Image alt text.

The English listing must:

- sound professional
- be clear
- preserve the artisan's meaning
- be suitable for an Indian marketplace
- avoid exaggerated claims
- avoid keyword stuffing
- avoid fake certifications
- avoid unsupported claims

Keep the English title preferably below 70 characters.

=========================================================
HINDI MARKETPLACE LISTING
=========================================================

Generate a natural Hindi marketplace listing.

The Hindi version should:

- sound natural to Indian customers
- preserve the original product meaning
- not be a word-for-word awkward translation
- remain professional
- avoid unsupported claims
- avoid exaggerated marketing

Generate:

1. Hindi title
2. Hindi description
3. Hindi meta description
4. Hindi alt text

=========================================================
SEO KEYWORDS
=========================================================

Generate a small set of useful SEO keywords based ONLY on the transcript.

Do not stuff keywords.

Prefer specific product-related phrases.

Maximum 10 keywords.

=========================================================
HASHTAGS
=========================================================

Generate relevant marketplace/social hashtags.

Maximum 10 hashtags.

Use normal hashtag format.

=========================================================
CONFIDENCE
=========================================================

Return a confidence value between 0 and 1.

The confidence should reflect how completely the transcript supports the generated product information.

Do NOT increase confidence simply because the writing sounds professional.

=========================================================
FINAL RULE
=========================================================

Return ONLY valid JSON matching the provided schema.
`;
}

/* =========================================================
 * MODEL FALLBACK
 * ========================================================= */

/**
 * Models are tried in order.
 *
 * A 503/high-demand error moves to the next model.
 *
 * This makes the cataloger resilient when one Gemini
 * model is temporarily overloaded.
 */
const GENERATION_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
] as const;

/* =========================================================
 * GENERATE WITH MODEL
 * ========================================================= */

async function generateWithModel(
  ai: GoogleGenAI,
  model: string,
  transcript: string,
  language: string,
): Promise<CatalogResult> {
  const prompt = buildPrompt(
    transcript,
    language,
  );

  console.log(
    `[Cataloger] Trying generation model: ${model}`,
  );

  const response =
    await ai.models.generateContent({
      model,

      contents: [
        {
          role: "user",

          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],

      config: {
        responseMimeType:
          "application/json",

        responseSchema:
          CATALOG_SCHEMA,

        maxOutputTokens: 4096,
      },
    });

  const rawText =
    response.text?.trim() ?? "";

  console.log(
    `[Cataloger] ${model} returned:`,
    rawText
      ? `${rawText.length} characters`
      : "EMPTY",
  );

  if (!rawText) {
    throw new Error(
      `${model} returned an empty catalog response.`,
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error(
      `${model} returned invalid JSON.`,
    );
  }

  return normalizeCatalogResult(
    parsed,
  );
}

/* =========================================================
 * ROUTE
 * ========================================================= */

export const Route = createFileRoute(
  "/api/cataloger/generate",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          /* =========================================
           * 1. READ REQUEST
           * ========================================= */

          const body =
            await request.json();

          const transcript =
            typeof body?.transcript ===
            "string"
              ? body.transcript.trim()
              : "";

          const language =
            typeof body?.language ===
            "string"
              ? body.language.trim()
              : "auto";

          /* =========================================
           * 2. VALIDATE TRANSCRIPT
           * ========================================= */

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

          /* =========================================
           * 3. API KEY
           * ========================================= */

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

          /* =========================================
           * 4. CREATE GEMINI CLIENT
           * ========================================= */

          const ai =
            new GoogleGenAI({
              apiKey,
            });

          /* =========================================
           * 5. TRY MODELS
           * ========================================= */

          let lastError: unknown = null;

          for (
            let index = 0;
            index <
            GENERATION_MODELS.length;
            index++
          ) {
            const model =
              GENERATION_MODELS[index];

            try {
              const result =
                await generateWithModel(
                  ai,
                  model,
                  transcript,
                  language,
                );

              console.log(
                `[Cataloger] Catalog generation successful with ${model}`,
              );

              return Response.json({
                success: true,

                catalog: result,

                model,
              });
            } catch (error) {
              lastError = error;

              const message =
                getErrorMessage(error);

              console.warn(
                `[Cataloger] ${model} failed:`,
                message,
              );

              /* =====================================
               * QUOTA ERROR
               *
               * Don't blindly keep retrying a model
               * when the project quota is exhausted.
               * ===================================== */

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

              /* =====================================
               * 503 / HIGH DEMAND
               *
               * Move to next model.
               * ===================================== */

              if (
                isUnavailableError(
                  message,
                )
              ) {
                if (
                  index <
                  GENERATION_MODELS.length -
                    1
                ) {
                  console.log(
                    `[Cataloger] ${model} unavailable. Trying next model...`,
                  );

                  continue;
                }

                break;
              }

              /* =====================================
               * NON-AVAILABILITY ERROR
               *
               * Don't hide real programming/API
               * errors behind multiple model calls.
               * ===================================== */

              break;
            }
          }

          /* =========================================
           * 6. ALL MODELS FAILED
           * ========================================= */

          const finalMessage =
            getErrorMessage(
              lastError,
            );

          console.error(
            "[Cataloger] All generation models failed:",
            finalMessage,
          );

          if (
            isUnavailableError(
              finalMessage,
            )
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "All Gemini catalog-generation models are temporarily busy. Please try again in a moment.",
              },
              {
                status: 503,
              },
            );
          }

          return Response.json(
            {
              success: false,
              error:
                `Catalog generation failed: ${finalMessage}`,
            },
            {
              status: 500,
            },
          );
        } catch (error) {
          const message =
            getErrorMessage(error);

          console.error(
            "Cataloger generation error:",
            error,
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
            isUnavailableError(message)
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Gemini catalog-generation service is temporarily unavailable. Please try again shortly.",
              },
              {
                status: 503,
              },
            );
          }

          return Response.json(
            {
              success: false,
              error:
                `Catalog generation failed: ${message}`,
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