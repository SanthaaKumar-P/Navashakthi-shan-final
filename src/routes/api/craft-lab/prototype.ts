import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

export const Route = createFileRoute(
  "/api/craft-lab/prototype",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          /* =================================================
             REQUEST BODY
          ================================================= */

          const body = (await request.json()) as {
            experiment?: {
              title?: string;
              concept?: string;
              rationale?: string;
              retainedAttributes?: string[];
              changedAttributes?: string[];
              productionNotes?: string[];
            };

            craftDNA?: {
              craftCategory?: {
                value?: string;
              };

              productType?: {
                value?: string;
              };

              material?: {
                value?: string;
              };

              primaryColour?: {
                value?: string;
              };

              secondaryColours?: {
                value?: string[];
              };

              shape?: {
                value?: string;
              };

              pattern?: {
                value?: string;
              };

              texture?: {
                value?: string;
              };

              finish?: {
                value?: string;
              };

              decoration?: {
                value?: string;
              };

              useCase?: {
                value?: string;
              };
            };

            baseImage?: string;
          };

          /* =================================================
             VALIDATION
          ================================================= */

          if (!body.experiment) {
            return Response.json(
              {
                success: false,
                error:
                  "Craft experiment is required.",
              },
              { status: 400 },
            );
          }

          if (!body.craftDNA) {
            return Response.json(
              {
                success: false,
                error:
                  "Craft DNA is required.",
              },
              { status: 400 },
            );
          }

          const apiKey =
            process.env.GEMINI_API_KEY;

          if (!apiKey) {
            console.error(
              "NAVSHAKTHI Craft Lab Prototype: GEMINI_API_KEY missing.",
            );

            return Response.json(
              {
                success: false,
                error:
                  "GEMINI_API_KEY is not configured.",
              },
              { status: 500 },
            );
          }

          /* =================================================
             GEMINI CLIENT
          ================================================= */

          const ai =
            new GoogleGenAI({
              apiKey,
            });

          const dna =
            body.craftDNA;

          const experiment =
            body.experiment;

          /* =================================================
             VISUAL PROTOTYPE PROMPT
          ================================================= */

          const prompt = `
You are the visual prototyping engine for NAVSHAKTHI Craft Lab.

Create a realistic product concept prototype based on an existing artisan craft and the selected Craft Lab experiment.

IMPORTANT RULES:

1. Preserve the core craft identity.

2. Preserve the stated material unless the experiment explicitly changes it.

3. Preserve the stated craft construction language.

4. Preserve important visual characteristics from the Craft DNA.

5. Do not invent geographical origin.

6. Do not invent GI certification.

7. Do not invent artisan identity.

8. Do not add unsupported cultural or heritage claims.

9. Do not turn the craft into an unrelated industrial product.

10. The result is a CONCEPT PROTOTYPE.
    It is NOT a claim that this product already exists.

11. Keep the proposed experiment changes visible but controlled.

12. If an existing craft image is provided, use it as the primary visual reference.

13. Maintain realistic material behaviour and artisan-manufacturable construction.

14. Do not introduce unrelated materials unless explicitly required by the experiment.

15. Do not add logos, branding, labels, text, watermarks, or typography.

CRAFT DNA:

Craft category:
${dna.craftCategory?.value ?? "Not provided"}

Product type:
${dna.productType?.value ?? "Not provided"}

Material:
${dna.material?.value ?? "Not provided"}

Primary colour:
${dna.primaryColour?.value ?? "Not provided"}

Secondary colours:
${
  dna.secondaryColours?.value?.join(", ") ??
  "Not provided"
}

Shape:
${dna.shape?.value ?? "Not provided"}

Pattern:
${dna.pattern?.value ?? "Not provided"}

Texture:
${dna.texture?.value ?? "Not provided"}

Finish:
${dna.finish?.value ?? "Not provided"}

Decoration:
${dna.decoration?.value ?? "Not provided"}

Use case:
${dna.useCase?.value ?? "Not provided"}

SELECTED CRAFT LAB EXPERIMENT:

Title:
${experiment.title ?? "Untitled experiment"}

Concept:
${experiment.concept ?? "Not provided"}

Rationale:
${experiment.rationale ?? "Not provided"}

Retained attributes:
${
  experiment.retainedAttributes?.join(", ") ??
  "None specified"
}

Changed attributes:
${
  experiment.changedAttributes?.join(", ") ??
  "None specified"
}

Production notes:
${
  experiment.productionNotes?.join("; ") ??
  "None specified"
}

VISUAL DIRECTION:

Generate one clean premium product concept photograph.

Show ONE primary product.

Use a neutral studio background.

Use realistic natural material texture.

Show clear artisan craftsmanship.

Keep proportions believable.

Keep the visual presentation premium but realistic.

Make the experiment changes visible.

Do not radically redesign the craft.

No text.

No labels.

No watermark.

No logos.

No people.

The image should communicate:

"This is a plausible new design experiment based on the artisan's existing craft identity."

This is a visual design prototype only.
`.trim();

          /* =================================================
             BUILD GEMINI CONTENTS
          ================================================= */

          const contents: Array<
            | string
            | {
                inlineData: {
                  mimeType: string;
                  data: string;
                };
              }
          > = [];

          /*
           * Existing enhanced craft image is preferred.
           *
           * The frontend passes:
           *
           * enhancedImage
           *       ↓
           * originalImage fallback
           *       ↓
           * baseImage
           */
          if (
            body.baseImage &&
            body.baseImage.startsWith(
              "data:",
            )
          ) {
            const match =
              body.baseImage.match(
                /^data:([^;]+);base64,(.+)$/,
              );

            if (match) {
              contents.push({
                inlineData: {
                  mimeType:
                    match[1],

                  data:
                    match[2],
                },
              });

              console.log(
                "NAVSHAKTHI Craft Lab Prototype: Existing craft image supplied as visual reference.",
              );
            }
          }

          /*
           * Prompt is added after the image so Gemini
           * receives the image + exact design instructions.
           */
          contents.push(
            prompt,
          );

          /* =================================================
             IMAGE GENERATION
          ================================================= */

          console.log(
            "NAVSHAKTHI Craft Lab Prototype: Generating visual prototype...",
          );

          const response =
            await ai.models.generateContent({
              model:
                "gemini-3.1-flash-image",

              contents,

              config: {
                /*
                 * IMPORTANT:
                 *
                 * Do NOT set:
                 *
                 * responseMimeType: "image/png"
                 *
                 * Gemini image generation uses
                 * responseModalities instead.
                 */
                responseModalities: [
                  "IMAGE",
                ],
              },
            });

          console.log(
            "NAVSHAKTHI Craft Lab Prototype: Gemini response received.",
          );

          /* =================================================
             FIND GENERATED IMAGE
          ================================================= */

          const parts =
            response.candidates?.[0]
              ?.content?.parts ?? [];

          const imagePart =
            parts.find(
              (part) =>
                Boolean(
                  part.inlineData?.data,
                ),
            );

          if (
            !imagePart?.inlineData?.data
          ) {
            console.error(
              "NAVSHAKTHI Craft Lab Prototype: Gemini returned no image data.",
            );

            /*
             * Log whether Gemini returned text instead.
             * This helps debugging without exposing
             * unnecessary response content to the client.
             */
            const textPart =
              parts.find(
                (part) =>
                  typeof part.text ===
                  "string",
              );

            if (textPart?.text) {
              console.error(
                "NAVSHAKTHI Craft Lab Prototype: Gemini returned text instead of an image.",
              );
            }

            return Response.json(
              {
                success: false,
                error:
                  "Gemini did not return a visual prototype. Please try generating the prototype again.",
              },
              { status: 502 },
            );
          }

          /* =================================================
             IMAGE DATA URL
          ================================================= */

          const mimeType =
            imagePart.inlineData
              .mimeType ??
            "image/png";

          const imageDataUrl =
            `data:${mimeType};base64,${imagePart.inlineData.data}`;

          console.log(
            "NAVSHAKTHI Craft Lab Prototype: Visual prototype generated successfully.",
          );

          /* =================================================
             SUCCESS
          ================================================= */

          return Response.json({
            success: true,

            result: {
              imageDataUrl,

              generatedAt:
                new Date().toISOString(),
            },
          });
        } catch (error) {
          console.error(
            "NAVSHAKTHI Craft Lab Prototype generation failed:",
            error,
          );

          return Response.json(
            {
              success: false,

              error:
                error instanceof Error
                  ? error.message
                  : "Unable to generate visual prototype.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});