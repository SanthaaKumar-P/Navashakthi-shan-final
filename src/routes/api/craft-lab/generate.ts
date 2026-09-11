import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

/* =========================================================
   GEMINI RESPONSE SCHEMA
========================================================= */

const EXPERIMENT_SCHEMA = {
  type: "object",
  properties: {
    experiments: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: {
            type: "string",
          },

          concept: {
            type: "string",
          },

          rationale: {
            type: "string",
          },

          retainedAttributes: {
            type: "array",
            items: {
              type: "string",
            },
          },

          changedAttributes: {
            type: "array",
            items: {
              type: "string",
            },
          },

          productionNotes: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },

        required: [
          "title",
          "concept",
          "rationale",
          "retainedAttributes",
          "changedAttributes",
          "productionNotes",
        ],
      },
    },
  },

  required: ["experiments"],
};

/* =========================================================
   TYPES
========================================================= */

type CraftLabRequest = {
  mode?: unknown;
  craftDNA?: unknown;
  marketContext?: unknown;
  artisanPrompt?: unknown;
};

type GeneratedExperiment = {
  title: string;
  concept: string;
  rationale: string;
  retainedAttributes: string[];
  changedAttributes: string[];
  productionNotes: string[];
};

const VALID_MODES = [
  "variant",
  "design",
  "new_product",
] as const;

type ValidMode =
  (typeof VALID_MODES)[number];

/* =========================================================
   VALIDATION HELPERS
========================================================= */

function isValidMode(
  value: unknown,
): value is ValidMode {
  return (
    typeof value === "string" &&
    VALID_MODES.includes(
      value as ValidMode,
    )
  );
}

function cleanString(
  value: unknown,
): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
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
      (item): item is string =>
        typeof item === "string" &&
        item.trim().length > 0,
    )
    .map(
      (item) => item.trim(),
    )
    .slice(0, 8);
}

/* =========================================================
   RECORD HELPER
========================================================= */

function isRecord(
  value: unknown,
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

/* =========================================================
   PROMPT
========================================================= */

function buildPrompt(
  body: CraftLabRequest,
): string {
  return `
You are NAVSHAKTHI Craft Lab.

Your job is to help a traditional artisan explore realistic craft experiments based on their existing Craft DNA and current market decision-support signals.

IMPORTANT:
You are generating EXPERIMENT IDEAS.
You are NOT certifying authenticity.
You are NOT predicting guaranteed sales.
You are NOT changing the artisan's Craft DNA.
You are NOT inventing cultural facts.

==================================================
CRAFT DNA
==================================================

${JSON.stringify(
  body.craftDNA ?? null,
  null,
  2,
)}

==================================================
FUTURE PLANNER / MARKET CONTEXT
==================================================

${JSON.stringify(
  body.marketContext ?? null,
  null,
  2,
)}

==================================================
SELECTED MODE
==================================================

${cleanString(body.mode)}

==================================================
ARTISAN REQUEST
==================================================

${
  cleanString(body.artisanPrompt) ||
  "No additional request provided."
}

==================================================
CORE RULES
==================================================

1. Preserve the recognisable identity of the existing craft.

2. Every experiment must clearly state:
   - what is retained
   - what is changed
   - why the experiment makes sense

3. Do not invent:
   - artisan identity
   - village
   - district
   - state
   - GI status
   - cultural history
   - heritage claims
   - government certification
   - customer commitments

4. Do not say:
   "This will definitely sell."
   "Customers will definitely buy this."
   "Demand will definitely increase."

5. Market information is only decision-support evidence.

6. If market data is insufficient, explicitly keep the idea exploratory.

7. Do not replace the original craft with an unrelated industrial product.

8. Prefer small, practical prototypes.

9. For Variant Explorer:
   preserve the core craft and explore controlled variations.

10. For Design Experiment:
    explore controlled changes to form, colour, finish,
    pattern, decoration or presentation.

11. For New Product:
    propose an adjacent product that can reasonably
    reuse existing craft knowledge, material or process.

12. Generate exactly 3 distinct experiments.

13. Each experiment MUST contain:
    - title
    - concept
    - rationale
    - retainedAttributes
    - changedAttributes
    - productionNotes

14. Return JSON only.

15. The top-level JSON object MUST contain:
    {
      "experiments": [...]
    }

16. Do not return markdown.
`.trim();
}

/* =========================================================
   NORMALIZE EXPERIMENT
========================================================= */

function normalizeExperiment(
  value: unknown,
): GeneratedExperiment | null {
  if (!isRecord(value)) {
    return null;
  }

  const experiment: GeneratedExperiment = {
    title: cleanString(
      value.title,
    ),

    concept: cleanString(
      value.concept,
    ),

    rationale: cleanString(
      value.rationale,
    ),

    retainedAttributes:
      cleanStringArray(
        value.retainedAttributes,
      ),

    changedAttributes:
      cleanStringArray(
        value.changedAttributes,
      ),

    productionNotes:
      cleanStringArray(
        value.productionNotes,
      ),
  };

  if (
    !experiment.title ||
    !experiment.concept ||
    !experiment.rationale
  ) {
    return null;
  }

  return experiment;
}

/* =========================================================
   EXTRACT EXPERIMENT ARRAY
========================================================= */

function extractExperimentArray(
  value: unknown,
): unknown[] | null {
  /*
   * Expected shape:
   *
   * {
   *   experiments: [...]
   * }
   */
  if (isRecord(value)) {
    const experiments =
      value.experiments;

    if (
      Array.isArray(
        experiments,
      )
    ) {
      return experiments;
    }

    /*
     * Some structured responses can
     * occasionally wrap the object.
     */
    const result =
      value.result;

    if (isRecord(result)) {
      const nested =
        result.experiments;

      if (
        Array.isArray(
          nested,
        )
      ) {
        return nested;
      }
    }

    const data =
      value.data;

    if (isRecord(data)) {
      const nested =
        data.experiments;

      if (
        Array.isArray(
          nested,
        )
      ) {
        return nested;
      }
    }
  }

  /*
   * Defensive support if the model returns
   * the experiment array directly.
   */
  if (Array.isArray(value)) {
    return value;
  }

  return null;
}

/* =========================================================
   PARSE GEMINI RESPONSE
========================================================= */

function parseGeminiExperiments(
  responseText: string,
): GeneratedExperiment[] {
  const cleanedText =
    responseText
      .trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

  if (!cleanedText) {
    throw new Error(
      "Gemini returned an empty Craft Lab response.",
    );
  }

  let parsed: unknown;

  try {
    parsed =
      JSON.parse(
        cleanedText,
      ) as unknown;
  } catch {
    /*
     * Sometimes a model can return additional
     * text around the JSON. Try to recover the
     * outermost JSON object or array.
     */
    const firstObject =
      cleanedText.indexOf("{");

    const lastObject =
      cleanedText.lastIndexOf("}");

    const firstArray =
      cleanedText.indexOf("[");

    const lastArray =
      cleanedText.lastIndexOf("]");

    let recovered: string | null =
      null;

    if (
      firstObject >= 0 &&
      lastObject > firstObject
    ) {
      recovered =
        cleanedText.slice(
          firstObject,
          lastObject + 1,
        );
    } else if (
      firstArray >= 0 &&
      lastArray > firstArray
    ) {
      recovered =
        cleanedText.slice(
          firstArray,
          lastArray + 1,
        );
    }

    if (!recovered) {
      throw new Error(
        "Gemini returned invalid Craft Lab JSON.",
      );
    }

    try {
      parsed =
        JSON.parse(
          recovered,
        ) as unknown;
    } catch {
      throw new Error(
        "Gemini returned invalid Craft Lab JSON.",
      );
    }
  }

  const rawExperiments =
    extractExperimentArray(
      parsed,
    );

  if (!rawExperiments) {
    throw new Error(
      "Gemini returned JSON, but no experiment list was found.",
    );
  }

  const experiments =
    rawExperiments
      .map(
        normalizeExperiment,
      )
      .filter(
        (
          experiment,
        ): experiment is GeneratedExperiment =>
          experiment !== null,
      )
      .slice(0, 3);

  if (
    experiments.length !== 3
  ) {
    throw new Error(
      `Craft Lab returned ${experiments.length} valid experiments. Exactly 3 are required.`,
    );
  }

  return experiments;
}

/* =========================================================
   ROUTE
========================================================= */

export const Route = createFileRoute(
  "/api/craft-lab/generate",
)({
  server: {
    handlers: {
      POST: async ({
        request,
      }) => {
        try {
          /* -----------------------------------------------
             READ REQUEST
          ------------------------------------------------ */

          const body =
            (await request.json()) as CraftLabRequest;

          /* -----------------------------------------------
             VALIDATE MODE
          ------------------------------------------------ */

          if (
            !isValidMode(
              body.mode,
            )
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "A valid Craft Lab mode is required.",
              },
              {
                status: 400,
              },
            );
          }

          /* -----------------------------------------------
             VALIDATE DNA
          ------------------------------------------------ */

          if (
            !body.craftDNA
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Craft DNA is required before running Craft Lab.",
              },
              {
                status: 400,
              },
            );
          }

          /* -----------------------------------------------
             API KEY
          ------------------------------------------------ */

          const apiKey =
            process.env.GEMINI_API_KEY;

          if (!apiKey) {
            console.error(
              "NAVSHAKTHI Craft Lab: GEMINI_API_KEY missing.",
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

          /* -----------------------------------------------
             GEMINI CLIENT
          ------------------------------------------------ */

          const ai =
            new GoogleGenAI({
              apiKey,
            });

          const contents = [
            {
              text:
                buildPrompt(body),
            },
          ];

          /*
           * Keep the existing fallback order.
           *
           * A model is only accepted if:
           * 1. Gemini request succeeds
           * 2. Response contains usable text
           * 3. JSON can be parsed
           * 4. Exactly 3 valid experiments exist
           */
          const models = [
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
          ];

          let lastError: unknown =
            null;

          /* -----------------------------------------------
             MODEL FALLBACK LOOP
          ------------------------------------------------ */

          for (const model of models) {
            try {
              console.log(
                `NAVSHAKTHI Craft Lab: Trying ${model}`,
              );

              const response =
                await ai.models.generateContent(
                  {
                    model,
                    contents,
                    config: {
                      responseMimeType:
                        "application/json",

                      responseSchema:
                        EXPERIMENT_SCHEMA,

                      maxOutputTokens: 3000,
                    },
                  },
                );

              /*
               * Gemini SDK exposes generated text
               * through response.text.
               */
              const responseText =
                response.text;

              console.log(
                `NAVSHAKTHI Craft Lab: ${model} returned ${responseText?.length ?? 0} characters.`,
              );

              if (
                !responseText
              ) {
                throw new Error(
                  `${model} returned an empty response.`,
                );
              }

              /*
               * Parse + validate.
               *
               * If this fails, continue to the
               * next Gemini model instead of
               * immediately failing the whole API.
               */
              const experiments =
                parseGeminiExperiments(
                  responseText,
                );

              console.log(
                `NAVSHAKTHI Craft Lab: ${model} returned ${experiments.length} valid experiments.`,
              );

              /*
               * SUCCESS
               */
              return Response.json({
                success: true,
                experiments,
              });
            } catch (error) {
              lastError =
                error;

              console.error(
                `NAVSHAKTHI Craft Lab: ${model} failed.`,
                error,
              );

              /*
               * Small delay before trying
               * another model.
               */
              await new Promise(
                (resolve) =>
                  setTimeout(
                    resolve,
                    500,
                  ),
              );
            }
          }

          /* -----------------------------------------------
             ALL MODELS FAILED
          ------------------------------------------------ */

          console.error(
            "NAVSHAKTHI Craft Lab: all Gemini models failed.",
            lastError,
          );

          const lastErrorMessage =
            lastError instanceof Error
              ? lastError.message
              : "Unknown Gemini error.";

          /*
           * Preserve useful debugging information
           * server-side while keeping the frontend
           * message clean.
           */
          console.error(
            `NAVSHAKTHI Craft Lab: Final error: ${lastErrorMessage}`,
          );

          return Response.json(
            {
              success: false,
              error:
                "Craft Lab could not generate three valid experiments right now. Please try again.",
            },
            {
              status: 503,
            },
          );
        } catch (error) {
          console.error(
            "NAVSHAKTHI Craft Lab failed:",
            error,
          );

          return Response.json(
            {
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to generate Craft Lab experiments.",
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