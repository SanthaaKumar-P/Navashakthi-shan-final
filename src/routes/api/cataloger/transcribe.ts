import { createFileRoute } from "@tanstack/react-router";
import { GoogleGenAI } from "@google/genai";

const MAX_AUDIO_SIZE = 8 * 1024 * 1024;

/**
 * Supported Indian / commonly used languages.
 *
 * "auto" means Gemini will automatically detect
 * the spoken language.
 */
const LANGUAGE_CODES: Record<string, string> = {
  auto: "",
  tamil: "ta-IN",
  hindi: "hi-IN",
  bengali: "bn-IN",
  telugu: "te-IN",
  marathi: "mr-IN",
  kannada: "kn-IN",
  english: "en-IN",
  malayalam: "ml-IN",
  gujarati: "gu-IN",
  punjabi: "pa-IN",
  odia: "or-IN",
  assamese: "as-IN",
  nepali: "ne-NP",
};

/**
 * Gemini supported audio formats used by the cataloger.
 */
const ALLOWED_AUDIO_TYPES = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/mp3",
  "audio/mpeg",
  "audio/m4a",
  "audio/mp4",
  "audio/aac",
  "audio/ogg",
  "audio/flac",
  "audio/webm",
  "audio/opus",
]);

/**
 * Normalize browser MIME types.
 *
 * Browsers can report:
 *   audio/mpeg
 *   audio/mp3
 *   audio/webm;codecs=opus
 *
 * Gemini only needs the base MIME type.
 */
function normalizeMimeType(
  type: string,
  fileName: string,
): string {
  const normalized = type
    .split(";")[0]
    .trim()
    .toLowerCase();

  if (ALLOWED_AUDIO_TYPES.has(normalized)) {
    return normalized === "audio/x-wav"
      ? "audio/wav"
      : normalized;
  }

  const extension = fileName
    .toLowerCase()
    .split(".")
    .pop();

  switch (extension) {
    case "mp3":
      return "audio/mp3";

    case "wav":
      return "audio/wav";

    case "m4a":
      return "audio/m4a";

    case "mp4":
      return "audio/mp4";

    case "aac":
      return "audio/aac";

    case "ogg":
      return "audio/ogg";

    case "flac":
      return "audio/flac";

    case "webm":
      return "audio/webm";

    case "opus":
      return "audio/opus";

    default:
      return normalized;
  }
}

/**
 * Convert unknown errors into readable text.
 */
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
    return "Unknown error";
  }
}

/**
 * Detect quota-related Gemini failures.
 */
function isQuotaError(message: string): boolean {
  const lower = message.toLowerCase();

  return (
    message.includes("429") ||
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("quotafailure")
  );
}

/**
 * Detect temporary service/model overload.
 */
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

/**
 * Safely extract an API error message from a Response.
 */
async function getResponseError(
  response: Response,
): Promise<string> {
  try {
    const body = await response.json();

    if (
      body &&
      typeof body === "object" &&
      "error" in body
    ) {
      const error = body.error;

      if (
        error &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return error.message;
      }

      return JSON.stringify(error);
    }

    return JSON.stringify(body);
  } catch {
    return await response.text();
  }
}

/**
 * Call Gemini 3.5 Transcribe using the current
 * Interactions REST API.
 *
 * Google currently documents:
 *
 * Files API
 *      ↓
 * Interactions API
 *      ↓
 * interaction.output_text
 *
 * This avoids SDK typing differences around the
 * Interactions API.
 */
async function transcribeWithInteractions(params: {
  apiKey: string;
  fileUri: string;
  mimeType: string;
  languageCode: string;
}): Promise<string> {
  const {
    apiKey,
    fileUri,
    mimeType,
    languageCode,
  } = params;

  const transcriptionConfig: Record<
    string,
    unknown
  > = {
    mode: "smart",
  };

  /**
   * If the user selected a language, provide a
   * language hint.
   *
   * If Auto Detect is selected, we intentionally
   * omit language_codes so Gemini performs
   * automatic detection.
   */
  if (languageCode) {
    transcriptionConfig.language_codes = [
      languageCode,
    ];
  }

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/interactions",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        model: "gemini-3.5-transcribe",

        input: [
          {
            type: "audio",
            uri: fileUri,
            mime_type: mimeType,
          },
        ],

        generation_config: {
          transcription_config:
            transcriptionConfig,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorMessage =
      await getResponseError(response);

    throw new Error(
      `Gemini Transcribe ${response.status}: ${errorMessage}`,
    );
  }

  const interaction =
    (await response.json()) as {
      output_text?: string;
    };

  const transcript =
    interaction.output_text?.trim() ?? "";

  return transcript;
}

/**
 * Fallback transcription using Gemini Flash-Lite.
 *
 * This is used only when the dedicated
 * transcription model is temporarily unavailable
 * or returns an empty response.
 */
async function transcribeWithFlashLite(params: {
  apiKey: string;
  fileUri: string;
  mimeType: string;
  languageCode: string;
}): Promise<string> {
  const {
    apiKey,
    fileUri,
    mimeType,
    languageCode,
  } = params;

  const languageInstruction = languageCode
    ? `The expected spoken language is ${languageCode}.`
    : "Automatically detect the spoken language.";

  const response = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },

      body: JSON.stringify({
        contents: [
          {
            role: "user",

            parts: [
              {
                file_data: {
                  file_uri: fileUri,
                  mime_type: mimeType,
                },
              },

              {
                text:
                  `Transcribe this artisan product voice note accurately.

${languageInstruction}

Important requirements:

1. Return ONLY the spoken transcription.
2. Do NOT translate the speech.
3. Do NOT summarize the speech.
4. Do NOT describe the audio.
5. Preserve the actual product name.
6. Preserve materials.
7. Preserve colors.
8. Preserve sizes and dimensions.
9. Preserve numbers.
10. Preserve techniques.
11. Preserve craft traditions.
12. Preserve product usage information.
13. Preserve other product facts exactly as spoken.
14. Do not invent missing information.
15. Do not add marketing claims.
16. Do not add explanations.`,
              },
            ],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorMessage =
      await getResponseError(response);

    throw new Error(
      `Gemini Flash-Lite ${response.status}: ${errorMessage}`,
    );
  }

  const result =
    (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

  const transcript =
    result.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim() ?? "";

  return transcript;
}

export const Route = createFileRoute(
  "/api/cataloger/transcribe",
)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let uploadedFile: {
          name?: string;
          uri?: string;
          mimeType?: string;
        } | null = null;

        try {
          /* =========================================
           * 1. READ FORM DATA
           * ========================================= */

          const formData =
            await request.formData();

          const audioEntry =
            formData.get("audio");

          const languageEntry =
            formData.get("language");

          /* =========================================
           * 2. CHECK AUDIO FILE
           * ========================================= */

          if (!(audioEntry instanceof File)) {
            return Response.json(
              {
                success: false,
                error:
                  "Please upload an audio file.",
              },
              {
                status: 400,
              },
            );
          }

          const audio = audioEntry;

          /* =========================================
           * 3. CHECK FILE SIZE
           * ========================================= */

          if (audio.size === 0) {
            return Response.json(
              {
                success: false,
                error:
                  "The uploaded audio file is empty.",
              },
              {
                status: 400,
              },
            );
          }

          if (
            audio.size >
            MAX_AUDIO_SIZE
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Audio file is too large. Maximum size is 8 MB.",
              },
              {
                status: 413,
              },
            );
          }

          /* =========================================
           * 4. NORMALIZE MIME TYPE
           * ========================================= */

          const mimeType =
            normalizeMimeType(
              audio.type || "",
              audio.name || "",
            );

          console.log(
            "[Cataloger] Audio received:",
            {
              name: audio.name,
              originalType: audio.type,
              mimeType,
              size: audio.size,
            },
          );

          if (
            !ALLOWED_AUDIO_TYPES.has(
              mimeType,
            )
          ) {
            return Response.json(
              {
                success: false,
                error:
                  `Unsupported audio format: ${
                    audio.type ||
                    audio.name
                  }`,
              },
              {
                status: 415,
              },
            );
          }

          /* =========================================
           * 5. GEMINI API KEY
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
           * 6. LANGUAGE
           * ========================================= */

          const language =
            typeof languageEntry === "string"
              ? languageEntry
                  .trim()
                  .toLowerCase()
              : "auto";

          const languageCode =
            LANGUAGE_CODES[language] ?? "";

          console.log(
            "[Cataloger] Language:",
            languageCode || "AUTO DETECT",
          );

          /* =========================================
           * 7. CREATE GEMINI CLIENT
           * ========================================= */

          const ai =
            new GoogleGenAI({
              apiKey,
            });

          /* =========================================
           * 8. UPLOAD AUDIO TO GEMINI FILES API
           * ========================================= */

          console.log(
            "[Cataloger] Uploading audio to Gemini Files API...",
          );

          uploadedFile =
            await ai.files.upload({
              file: audio,

              config: {
                mimeType,
                displayName:
                  audio.name ||
                  "artisan-voice-note",
              },
            });

          console.log(
            "[Cataloger] Gemini upload completed:",
            {
              name:
                uploadedFile?.name,
              uri:
                uploadedFile?.uri,
              mimeType:
                uploadedFile?.mimeType,
            },
          );

          if (!uploadedFile?.uri) {
            throw new Error(
              "Gemini uploaded the audio but did not return a file URI.",
            );
          }

          /* =========================================
           * 9. PRIMARY TRANSCRIPTION
           * ========================================= */

          let transcript = "";

          try {
            console.log(
              "[Cataloger] Trying Gemini 3.5 Transcribe...",
            );

            transcript =
              await transcribeWithInteractions(
                {
                  apiKey,
                  fileUri:
                    uploadedFile.uri,
                  mimeType:
                    uploadedFile.mimeType ||
                    mimeType,
                  languageCode,
                },
              );

            console.log(
              "[Cataloger] Primary transcription result:",
              transcript
                ? `${transcript.length} characters`
                : "EMPTY",
            );
          } catch (primaryError) {
            const primaryMessage =
              getErrorMessage(
                primaryError,
              );

            console.warn(
              "[Cataloger] Primary transcription failed:",
              primaryMessage,
            );

            /*
             * Only fallback for temporary
             * availability / overload errors.
             *
             * Do NOT hide quota/authentication/
             * invalid-request errors.
             */
            if (
              !isUnavailableError(
                primaryMessage,
              )
            ) {
              throw primaryError;
            }

            console.log(
              "[Cataloger] Primary model unavailable.",
            );

            console.log(
              "[Cataloger] Falling back to Gemini 3.5 Flash-Lite...",
            );

            transcript =
              await transcribeWithFlashLite(
                {
                  apiKey,
                  fileUri:
                    uploadedFile.uri,
                  mimeType:
                    uploadedFile.mimeType ||
                    mimeType,
                  languageCode,
                },
              );

            console.log(
              "[Cataloger] Flash-Lite fallback result:",
              transcript
                ? `${transcript.length} characters`
                : "EMPTY",
            );
          }

          /* =========================================
           * 10. FALLBACK IF PRIMARY RETURNED EMPTY
           * ========================================= */

          if (!transcript) {
            console.warn(
              "[Cataloger] Primary model returned EMPTY output.",
            );

            console.log(
              "[Cataloger] Trying Flash-Lite fallback...",
            );

            transcript =
              await transcribeWithFlashLite(
                {
                  apiKey,
                  fileUri:
                    uploadedFile.uri,
                  mimeType:
                    uploadedFile.mimeType ||
                    mimeType,
                  languageCode,
                },
              );

            console.log(
              "[Cataloger] Flash-Lite fallback result:",
              transcript
                ? `${transcript.length} characters`
                : "EMPTY",
            );
          }

          /* =========================================
           * 11. STILL EMPTY
           * ========================================= */

          if (!transcript) {
            return Response.json(
              {
                success: false,
                error:
                  "Gemini could not detect any spoken words in this audio. Please try a clear recording with speech for a few seconds.",
              },
              {
                status: 422,
              },
            );
          }

          /* =========================================
           * 12. SUCCESS
           * ========================================= */

          console.log(
            "[Cataloger] Transcription successful.",
          );

          return Response.json({
            success: true,

            transcript,

            languageHint:
              languageCode || "auto",
          });
        } catch (error) {
          const message =
            getErrorMessage(error);

          console.error(
            "[Cataloger] Transcription error:",
            message,
          );

          /* =========================================
           * QUOTA
           * ========================================= */

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

          /* =========================================
           * TEMPORARY AVAILABILITY
           * ========================================= */

          if (
            isUnavailableError(message)
          ) {
            return Response.json(
              {
                success: false,
                error:
                  "Gemini transcription models are temporarily unavailable. Please try again in a moment.",
              },
              {
                status: 503,
              },
            );
          }

          /* =========================================
           * GENERAL ERROR
           * ========================================= */

          return Response.json(
            {
              success: false,
              error:
                `Audio transcription failed: ${message}`,
            },
            {
              status: 500,
            },
          );
        } finally {
          /* =========================================
           * 13. DELETE TEMPORARY GEMINI FILE
           * ========================================= */

          if (uploadedFile?.name) {
            try {
              const apiKey =
                process.env.GEMINI_API_KEY;

              if (apiKey) {
                const cleanupAI =
                  new GoogleGenAI({
                    apiKey,
                  });

                await cleanupAI.files.delete({
                  name: uploadedFile.name,
                });

                console.log(
                  "[Cataloger] Temporary Gemini file deleted.",
                );
              }
            } catch (cleanupError) {
              console.warn(
                "[Cataloger] Gemini file cleanup failed:",
                getErrorMessage(
                  cleanupError,
                ),
              );
            }
          }
        }
      },
    },
  },
});