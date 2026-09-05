import { GoogleGenAI, Type } from "@google/genai";
import { createFileRoute } from "@tanstack/react-router";

const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

const AUTHENTICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    productMatch: {
      type: Type.NUMBER,
      description:
        "Visual consistency score from 0 to 100 between the uploaded craft image and the supplied catalogue description.",
    },
    handmadeEvidence: {
      type: Type.NUMBER,
      description:
        "Visual evidence score from 0 to 100 indicating visible signs consistent with handcrafted production.",
    },
    materialConsistency: {
      type: Type.NUMBER,
      description:
        "Visual consistency score from 0 to 100 between visible material characteristics and the supplied catalogue materials.",
    },
    craftTechniqueConsistency: {
      type: Type.NUMBER,
      description:
        "Visual consistency score from 0 to 100 between visible construction/detailing and the supplied craft description.",
    },
    overallScore: {
      type: Type.NUMBER,
      description:
        "Overall AI assessment score from 0 to 100. This is an image-based assessment, not legal certification.",
    },
    decision: {
      type: Type.STRING,
      enum: ["High confidence", "Review recommended", "Low confidence"],
    },
    detectedCraft: {
      type: Type.STRING,
    },
    detectedMaterials: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    visibleEvidence: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    concerns: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
    },
    explanation: {
      type: Type.STRING,
    },
  },
  required: [
    "productMatch",
    "handmadeEvidence",
    "materialConsistency",
    "craftTechniqueConsistency",
    "overallScore",
    "decision",
    "detectedCraft",
    "detectedMaterials",
    "visibleEvidence",
    "concerns",
    "explanation",
  ],
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export const Route = createFileRoute("/api/authentication/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const formData = await request.formData();

          const image = formData.get("image");
          const productName =
            String(formData.get("productName") ?? "").trim();
          const category =
            String(formData.get("category") ?? "").trim();
          const village =
            String(formData.get("village") ?? "").trim();
          const state =
            String(formData.get("state") ?? "").trim();
          const story =
            String(formData.get("story") ?? "").trim();
          const materialsRaw =
            String(formData.get("materials") ?? "").trim();
          const catalogueAuthenticity = Number(
            formData.get("catalogueAuthenticity") ?? 0,
          );
          const craftmark =
            String(formData.get("craftmark") ?? "false") === "true";
          const giCertified =
            String(formData.get("giCertified") ?? "false") === "true";

          if (!(image instanceof File)) {
            return Response.json(
              {
                success: false,
                error: "Product image is required.",
              },
              { status: 400 },
            );
          }

          if (!image.type.startsWith("image/")) {
            return Response.json(
              {
                success: false,
                error: "Only image files are supported.",
              },
              { status: 400 },
            );
          }

          if (image.size === 0) {
            return Response.json(
              {
                success: false,
                error: "Uploaded image is empty.",
              },
              { status: 400 },
            );
          }

          if (image.size > MAX_IMAGE_SIZE) {
            return Response.json(
              {
                success: false,
                error: "Image must be smaller than 8 MB.",
              },
              { status: 400 },
            );
          }

          const apiKey = process.env.GEMINI_API_KEY;

          if (!apiKey) {
            console.error(
              "NAVSHAKTHI: GEMINI_API_KEY is missing.",
            );

            return Response.json(
              {
                success: false,
                error:
                  "Gemini API key is not configured on the server.",
              },
              { status: 500 },
            );
          }

          const materials = materialsRaw
            ? materialsRaw
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : [];

          const imageBuffer = await image.arrayBuffer();
          const base64Image = Buffer.from(imageBuffer).toString(
            "base64",
          );

          const ai = new GoogleGenAI({
            apiKey,
          });

          const prompt = `
You are the visual AI authentication engine for NAVSHAKTHI, a digital platform for Indian handmade crafts.

Analyze the supplied product photograph together with the catalogue record below.

CATALOGUE RECORD
Product name: ${productName || "Not provided"}
Category: ${category || "Not provided"}
Village: ${village || "Not provided"}
State: ${state || "Not provided"}
Story: ${story || "Not provided"}
Declared materials: ${
            materials.length > 0 ? materials.join(", ") : "Not provided"
          }
Catalogue authenticity score: ${
            Number.isFinite(catalogueAuthenticity)
              ? catalogueAuthenticity
              : 0
          }
Craftmark catalogue flag: ${craftmark ? "true" : "false"}
GI catalogue flag: ${giCertified ? "true" : "false"}

TASK

Assess ONLY what can reasonably be inferred from the photograph and the supplied catalogue record.

Look for:
1. Whether the visible object matches the expected product.
2. Visible evidence consistent with handmade production.
3. Material appearance.
4. Construction, carving, weaving, stitching, casting, finishing or decorative patterns.
5. Signs that the image may show a mass-produced or machine-like object.
6. Image limitations that prevent reliable assessment.

IMPORTANT RULES

- Do NOT claim that an image alone proves authenticity.
- Do NOT claim that Craftmark or GI certification has been independently verified.
- Do NOT invent an external government registry result.
- Do NOT invent an artisan identity.
- Do NOT infer hidden manufacturing processes that cannot be seen.
- If evidence is weak, lower the score and explain why.
- The overall score must reflect visual evidence, not simply copy the catalogue authenticity score.
- Catalogue authenticity is only a reference input.
- Mention uncertainty when the image is insufficient.
- Return concise, evidence-based findings.
`;

          const contents = [
            {
              inlineData: {
                mimeType: image.type,
                data: base64Image,
              },
            },
            {
              text: prompt,
            },
          ];

          /*
           * Reuse the project's existing Gemini fallback strategy.
           * If one model is temporarily unavailable, another model
           * gets a chance.
           */
          const models = [
            "gemini-3.8-flash",
            "gemini-3.7-flash",
            "gemini-3.6-flash",
          ];

          let response:
            Awaited<
              ReturnType<typeof ai.models.generateContent>
            > | null = null;

          let lastError: unknown = null;
          let usedModel = "";

          for (const model of models) {
            try {
              console.log(
                `NAVSHAKTHI authentication: trying ${model}`,
              );

              response = await ai.models.generateContent({
                model,
                contents,
                config: {
                  responseMimeType: "application/json",
                  responseSchema: AUTHENTICATION_SCHEMA,
                  maxOutputTokens: 2048,
                },
              });

              usedModel = model;

              console.log(
                `NAVSHAKTHI authentication: ${model} succeeded.`,
              );

              break;
            } catch (error) {
              lastError = error;

              console.error(
                `NAVSHAKTHI authentication: ${model} failed.`,
                error,
              );

              await new Promise((resolve) =>
                setTimeout(resolve, 400),
              );
            }
          }

          if (!response) {
            console.error(
              "NAVSHAKTHI authentication: all Gemini models failed.",
              lastError,
            );

            const message = getErrorMessage(lastError);

            const isQuota =
              message.includes("429") ||
              message.toLowerCase().includes("quota") ||
              message
                .toLowerCase()
                .includes("resource exhausted");

            return Response.json(
              {
                success: false,
                error: isQuota
                  ? "Gemini AI quota is currently exhausted. Please try again later or use another configured Google Cloud project."
                  : "Gemini AI is temporarily unavailable. Please try again in a few moments.",
              },
              {
                status: isQuota ? 429 : 503,
              },
            );
          }

          const raw = response.text?.trim();

          if (!raw) {
            return Response.json(
              {
                success: false,
                error:
                  "Gemini returned an empty authentication result.",
              },
              { status: 502 },
            );
          }

          let result: {
            productMatch: number;
            handmadeEvidence: number;
            materialConsistency: number;
            craftTechniqueConsistency: number;
            overallScore: number;
            decision: string;
            detectedCraft: string;
            detectedMaterials: string[];
            visibleEvidence: string[];
            concerns: string[];
            explanation: string;
          };

          try {
            result = JSON.parse(raw);
          } catch (error) {
            console.error(
              "NAVSHAKTHI authentication: invalid Gemini JSON.",
              error,
            );

            return Response.json(
              {
                success: false,
                error:
                  "The AI returned an invalid authentication result. Please retry.",
              },
              { status: 502 },
            );
          }

          const normalized = {
            productMatch: clamp(result.productMatch),
            handmadeEvidence: clamp(result.handmadeEvidence),
            materialConsistency: clamp(
              result.materialConsistency,
            ),
            craftTechniqueConsistency: clamp(
              result.craftTechniqueConsistency,
            ),
            overallScore: clamp(result.overallScore),
            decision: result.decision,
            detectedCraft: result.detectedCraft || "Not determined",
            detectedMaterials: Array.isArray(
              result.detectedMaterials,
            )
              ? result.detectedMaterials.slice(0, 8)
              : [],
            visibleEvidence: Array.isArray(result.visibleEvidence)
              ? result.visibleEvidence.slice(0, 8)
              : [],
            concerns: Array.isArray(result.concerns)
              ? result.concerns.slice(0, 8)
              : [],
            explanation:
              result.explanation ||
              "No additional explanation was returned.",
          };

          return Response.json({
            success: true,
            model: usedModel,
            analyzedAt: new Date().toISOString(),
            catalogue: {
              productName,
              category,
              village,
              state,
              materials,
              authenticity: Number.isFinite(
                catalogueAuthenticity,
              )
                ? clamp(catalogueAuthenticity)
                : null,
              craftmark,
              giCertified,
            },
            result: normalized,
          });
        } catch (error) {
          console.error(
            "NAVSHAKTHI authentication API error:",
            error,
          );

          return Response.json(
            {
              success: false,
              error:
                "Authentication analysis failed unexpectedly. Please retry.",
            },
            { status: 500 },
          );
        }
      },
    },
  },
});