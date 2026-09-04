import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

/* =========================================================
   NAVSHAKTHI - AI CRAFT ANALYSIS API
   ========================================================= */

const CRAFT_CATEGORIES = [
  "Pottery",
  "Handloom & Textiles",
  "Wooden Crafts",
  "Metal Casting",
  "Jewelry & Beadwork",
  "Folk & Tribal Art",
  "Bamboo & Cane Products",
  "Sculptures & Stone Carving",
  "Folk Musical Instruments",
] as const;

const FINISH_LEVELS = [
  "Basic",
  "Fine",
  "Intricate",
] as const;

const SIZE_LEVELS = [
  "Mini",
  "Small",
  "Standard",
  "Medium",
  "Large",
  "Extra Large",
  "Monumental",
] as const;

/* =========================================================
   GEMINI STRUCTURED OUTPUT SCHEMA
   ========================================================= */

const ANALYSIS_SCHEMA = {
  type: "object",

  properties: {
    category: {
      type: "string",
      enum: CRAFT_CATEGORIES,
      description:
        "Traditional craft category that best matches the actual product shown in the image.",
    },

    productType: {
      type: "string",
      description:
        "Specific product type visible in the image.",
    },

    material: {
      type: "string",
      description:
        "Primary visible material used to make the product.",
    },

    finish: {
      type: "string",
      enum: FINISH_LEVELS,
      description:
        "Visible level of workmanship and finishing.",
    },

    complexity: {
      type: "integer",
      minimum: 1,
      maximum: 10,
      description:
        "Visual craftsmanship complexity from 1 to 10.",
    },

    decoration: {
      type: "string",
      description:
        "Description of visible patterns, weaving, carving, painting, motifs, beads, engraving or other decorative details.",
    },

    sizeLabel: {
      type: "string",
      enum: SIZE_LEVELS,
      description:
        "Broad visual size category. Do not claim exact dimensions from one image.",
    },

    dimensions: {
      type: "string",
      description:
        "Approximate dimensions only when visually reasonable. Otherwise return 'Needs artisan confirmation'.",
    },

    confidence: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "Confidence in the visual classification from 0 to 100.",
    },
  },

  required: [
    "category",
    "productType",
    "material",
    "finish",
    "complexity",
    "decoration",
    "sizeLabel",
    "dimensions",
    "confidence",
  ],
};

/* =========================================================
   GEMINI PROMPT
   ========================================================= */

const ANALYSIS_PROMPT = `
You are NAVSHAKTHI's visual craft analysis engine.

NAVSHAKTHI helps Indian traditional artisans digitize,
understand and fairly price handmade products.

You are receiving an ACTUAL PRODUCT IMAGE.

Your job is ONLY to analyze the product shown in the image.

DO NOT calculate a price.
DO NOT recommend a price.
DO NOT estimate market price.
DO NOT invent government prices.

Return ONLY the structured JSON requested by the schema.

=========================================================
CRITICAL IMAGE ANALYSIS RULES
=========================================================

1. Analyze the actual visual content/pixels of the image.

2. NEVER use the filename to classify the product.

3. NEVER assume the product is pottery.

4. Do not use filename clues such as:
   "pot", "bamboo", "wood", "metal", etc.

5. Identify the product based on its actual visual structure.

6. Carefully distinguish between:
   - Pottery
   - Handloom & Textiles
   - Wooden Crafts
   - Metal Casting
   - Jewelry & Beadwork
   - Folk & Tribal Art
   - Bamboo & Cane Products
   - Sculptures & Stone Carving
   - Folk Musical Instruments

=========================================================
MATERIAL IDENTIFICATION
=========================================================

Look for visible evidence.

Examples:

Bamboo / Cane:
- woven strips
- cane lattice
- natural bamboo texture
- basket weaving
- curved bamboo framework
- woven cylindrical or spherical structures

Wood:
- visible wood grain
- carved wooden body
- wooden joints
- solid wooden construction

Pottery:
- clay body
- terracotta appearance
- ceramic/glazed surface
- wheel-made vessel
- fired clay structure

Textile:
- woven threads
- fabric
- embroidery
- handloom patterns
- yarn/fibre construction

Metal:
- metallic surface
- cast metal structure
- brass/copper/iron appearance
- metal engraving

Jewelry:
- beads
- necklace
- earrings
- bracelets
- ornaments
- gemstone-like components

Stone:
- carved stone
- rock texture
- stone sculpture

Musical instrument:
- recognizable traditional instrument structure
- flute
- drum
- string instrument
- percussion instrument
- other traditional folk instruments

=========================================================
PRODUCT TYPE
=========================================================

Identify the most specific product type that can reasonably
be determined from the image.

Examples:

"Bamboo and cane lantern"

"Handwoven bamboo basket"

"Terracotta water pot"

"Wooden carved toy"

"Handwoven cotton saree"

"Brass decorative lamp"

"Beaded necklace"

Do not make the description unnecessarily generic.

=========================================================
FINISH
=========================================================

Basic:
Simple construction and minimal finishing.

Fine:
Clearly refined workmanship with good detailing.

Intricate:
Highly detailed, complex weaving/carving/ornamentation
or sophisticated craftsmanship.

Judge only from visible evidence.

=========================================================
COMPLEXITY
=========================================================

Give a visual craftsmanship complexity score:

1-2:
Very simple construction.

3-4:
Simple handmade construction.

5-6:
Moderately detailed craftsmanship.

7-8:
Complex construction or detailed decorative work.

9-10:
Highly intricate craftsmanship.

Do not increase complexity merely because the product is
traditional.

=========================================================
SIZE
=========================================================

Use only broad categories:

Mini
Small
Standard
Medium
Large
Extra Large
Monumental

A single photograph usually cannot establish exact
physical dimensions.

If there is no reliable reference object:

dimensions = "Needs artisan confirmation"

NEVER invent exact centimetres or inches.

=========================================================
CONFIDENCE
=========================================================

Confidence must reflect actual visual certainty.

High confidence:
The product and material are visually obvious.

Medium confidence:
The product is identifiable but some details are uncertain.

Low confidence:
The image is ambiguous, low quality or partially obscured.

=========================================================
FINAL RULE
=========================================================

Analyze the ACTUAL IMAGE.

Do not default to pottery.

Do not use the filename.

Do not calculate price.

Return only valid structured JSON.
`;

/* =========================================================
   VALIDATION HELPERS
   ========================================================= */

function isValidCategory(
  value: unknown,
): value is (typeof CRAFT_CATEGORIES)[number] {
  return (
    typeof value === "string" &&
    CRAFT_CATEGORIES.includes(
      value as (typeof CRAFT_CATEGORIES)[number],
    )
  );
}

function isValidFinish(
  value: unknown,
): value is (typeof FINISH_LEVELS)[number] {
  return (
    typeof value === "string" &&
    FINISH_LEVELS.includes(
      value as (typeof FINISH_LEVELS)[number],
    )
  );
}

function isValidSize(
  value: unknown,
): value is (typeof SIZE_LEVELS)[number] {
  return (
    typeof value === "string" &&
    SIZE_LEVELS.includes(
      value as (typeof SIZE_LEVELS)[number],
    )
  );
}

function getValidInteger(
  value: unknown,
  minimum: number,
  maximum: number,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  const integer = Math.round(value);

  if (
    integer < minimum ||
    integer > maximum
  ) {
    return null;
  }

  return integer;
}

/* =========================================================
   ROUTE
   ========================================================= */

export const Route = createFileRoute(
  "/api/pricing/analyze",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          /* -------------------------------------------------
             1. RECEIVE FORM DATA
             ------------------------------------------------- */

          const formData = await request.formData();

          const image = formData.get("image");

          if (!(image instanceof File)) {
            return Response.json(
              {
                success: false,
                error: "Craft image is required.",
              },
              {
                status: 400,
              },
            );
          }

          /* -------------------------------------------------
             2. IMAGE VALIDATION
             ------------------------------------------------- */

          if (!image.type.startsWith("image/")) {
            return Response.json(
              {
                success: false,
                error: "Uploaded file must be an image.",
              },
              {
                status: 400,
              },
            );
          }

          const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

          if (image.size > MAX_IMAGE_SIZE) {
            return Response.json(
              {
                success: false,
                error: "Image must be smaller than 8 MB.",
              },
              {
                status: 400,
              },
            );
          }

          if (image.size === 0) {
            return Response.json(
              {
                success: false,
                error: "Uploaded image is empty.",
              },
              {
                status: 400,
              },
            );
          }

          /* -------------------------------------------------
             3. API KEY
             ------------------------------------------------- */

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            console.error(
              "NAVSHAKTHI: GEMINI_API_KEY missing.",
            );

            return Response.json(
              {
                success: false,
                error:
                  "Gemini API key is not configured on the server.",
              },
              {
                status: 500,
              },
            );
          }

          /* -------------------------------------------------
             4. CONVERT IMAGE TO BASE64
             ------------------------------------------------- */

          const imageBuffer = await image.arrayBuffer();

          const base64Image = Buffer.from(
            imageBuffer,
          ).toString("base64");

          /* -------------------------------------------------
             5. GEMINI CLIENT
             ------------------------------------------------- */

          const ai = new GoogleGenAI({
            apiKey,
          });

          /* -------------------------------------------------
             6. IMAGE + PROMPT
             ------------------------------------------------- */

          const contents = [
            {
              inlineData: {
                mimeType: image.type,
                data: base64Image,
              },
            },
            {
              text: ANALYSIS_PROMPT,
            },
          ];

          /* -------------------------------------------------
             7. MODEL FALLBACK SYSTEM

             If one Gemini model temporarily returns
             503/UNAVAILABLE, try the next model.
             ------------------------------------------------- */

          const models = [
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
          ];

          let response:
            Awaited<
              ReturnType<
                typeof ai.models.generateContent
              >
            > | null = null;

          let lastError: unknown = null;

          for (const model of models) {
            try {
              console.log(
                `NAVSHAKTHI: Trying ${model}`,
              );

              response =
                await ai.models.generateContent({
                  model,
                  contents,

                  config: {
                    responseMimeType:
                      "application/json",

                    responseSchema:
                      ANALYSIS_SCHEMA,

                    maxOutputTokens: 2048,
                  },
                });

              console.log(
                `NAVSHAKTHI: ${model} succeeded.`,
              );

              break;
            } catch (error) {
              lastError = error;

              console.error(
                `NAVSHAKTHI: ${model} failed.`,
                error,
              );

              /*
               * Wait briefly before trying
               * the next model.
               */
              await new Promise((resolve) =>
                setTimeout(resolve, 500),
              );
            }
          }

          /* -------------------------------------------------
             8. ALL MODELS FAILED
             ------------------------------------------------- */

          if (!response) {
            console.error(
              "NAVSHAKTHI: All Gemini models failed.",
              lastError,
            );

            return Response.json(
              {
                success: false,
                error:
                  "Gemini AI is temporarily unavailable. Please try again in a few moments.",
              },
              {
                status: 503,
              },
            );
          }

          /* -------------------------------------------------
             9. READ RESPONSE
             ------------------------------------------------- */

          const responseText = response.text;

          if (!responseText) {
            throw new Error(
              "Gemini returned an empty response.",
            );
          }

          /* -------------------------------------------------
             10. PARSE JSON
             ------------------------------------------------- */

          let analysis: Record<string, unknown>;

          try {
            analysis = JSON.parse(responseText);
          } catch (error) {
            console.error(
              "NAVSHAKTHI: Invalid Gemini JSON:",
              responseText,
            );

            throw new Error(
              "Gemini returned an invalid analysis response.",
            );
          }

          /* -------------------------------------------------
             11. VALIDATE CATEGORY
             ------------------------------------------------- */

          if (!isValidCategory(analysis.category)) {
            throw new Error(
              "Gemini returned an invalid craft category.",
            );
          }

          /* -------------------------------------------------
             12. VALIDATE PRODUCT TYPE
             ------------------------------------------------- */

          if (
            typeof analysis.productType !==
              "string" ||
            !analysis.productType.trim()
          ) {
            throw new Error(
              "Gemini did not return a valid product type.",
            );
          }

          /* -------------------------------------------------
             13. VALIDATE MATERIAL
             ------------------------------------------------- */

          if (
            typeof analysis.material !==
              "string" ||
            !analysis.material.trim()
          ) {
            throw new Error(
              "Gemini did not return a valid material.",
            );
          }

          /* -------------------------------------------------
             14. VALIDATE FINISH
             ------------------------------------------------- */

          if (!isValidFinish(analysis.finish)) {
            throw new Error(
              "Gemini returned an invalid finish level.",
            );
          }

          /* -------------------------------------------------
             15. VALIDATE COMPLEXITY
             ------------------------------------------------- */

          const complexity = getValidInteger(
            analysis.complexity,
            1,
            10,
          );

          if (complexity === null) {
            throw new Error(
              "Gemini returned invalid craftsmanship complexity.",
            );
          }

          /* -------------------------------------------------
             16. VALIDATE DECORATION
             ------------------------------------------------- */

          if (
            typeof analysis.decoration !==
              "string" ||
            !analysis.decoration.trim()
          ) {
            throw new Error(
              "Gemini did not return a valid decoration description.",
            );
          }

          /* -------------------------------------------------
             17. VALIDATE SIZE
             ------------------------------------------------- */

          if (!isValidSize(analysis.sizeLabel)) {
            throw new Error(
              "Gemini returned an invalid size category.",
            );
          }

          /* -------------------------------------------------
             18. VALIDATE DIMENSIONS
             ------------------------------------------------- */

          if (
            typeof analysis.dimensions !==
              "string" ||
            !analysis.dimensions.trim()
          ) {
            throw new Error(
              "Gemini did not return valid dimension information.",
            );
          }

          /* -------------------------------------------------
             19. VALIDATE CONFIDENCE
             ------------------------------------------------- */

          const confidence = getValidInteger(
            analysis.confidence,
            0,
            100,
          );

          if (confidence === null) {
            throw new Error(
              "Gemini returned invalid confidence.",
            );
          }

          /* -------------------------------------------------
             20. CLEAN RESPONSE
             ------------------------------------------------- */

          const cleanAnalysis = {
            category: analysis.category,

            productType:
              analysis.productType.trim(),

            material:
              analysis.material.trim(),

            finish: analysis.finish,

            complexity,

            decoration:
              analysis.decoration.trim(),

            sizeLabel: analysis.sizeLabel,

            dimensions:
              analysis.dimensions.trim(),

            confidence,
          };

          /* -------------------------------------------------
             21. SERVER LOG
             ------------------------------------------------- */

          console.log(
            "====================================",
          );

          console.log(
            "NAVSHAKTHI AI ANALYSIS",
          );

          console.log(cleanAnalysis);

          console.log(
            "====================================",
          );

          /* -------------------------------------------------
             22. SEND TO FRONTEND
             ------------------------------------------------- */

          return Response.json({
            success: true,
            analysis: cleanAnalysis,
          });
        } catch (error) {
          /* -------------------------------------------------
             GLOBAL ERROR HANDLER
             ------------------------------------------------- */

          console.error(
            "NAVSHAKTHI: Craft analysis failed:",
            error,
          );

          return Response.json(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to analyze the craft image.",
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