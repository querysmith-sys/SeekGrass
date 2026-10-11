import OpenAI from "openai";

const OPENROUTER_MODELS = [
    "google/gemma-4-26b-a4b-it:free",
    "google/gemma-4-31b-it:free",
    "dots-studio/dots-3-note-preview:free",
];
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

export const handleRiddleSubmissionVerification = async (
    base64String: string,
    PROMPT: string,
    riddle: string,
    mimeType: string
) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not defined in the environment variables.");
    }

    const openRouter = new OpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
    });

    let lastError: unknown;

    for (const model of OPENROUTER_MODELS) {
        try {
            const response = await openRouter.chat.completions.create({
                model,
                temperature: 0,
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: PROMPT,
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Riddle to verify:\n${riddle}\n\nAnalyze the uploaded image against this riddle.`,
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64String}`,
                                },
                            },
                        ],
                    },
                ],
            });

            const result = response.choices[0]?.message.content;
            if (typeof result !== "string" || result.length === 0) {
                throw new Error(`${model} returned an empty verification response.`);
            }

            return result;
        } catch (error: unknown) {
            lastError = error;
            const statusCode = error instanceof OpenAI.APIError ? error.status : undefined;

            if (statusCode === undefined || !RETRYABLE_STATUS_CODES.has(statusCode)) {
                throw error;
            }

            console.warn(
                `OpenRouter model ${model} ${statusCode ? `returned ${statusCode}` : "returned no content"}; trying the next free vision model.`,
            );
        }
    }

    if (lastError instanceof Error) {
        throw new Error(`All free OpenRouter vision models failed. Last error: ${lastError.message}`, {
            cause: lastError,
        });
    }

    if (lastError !== undefined) {
        throw lastError;
    }

    throw new Error("No OpenRouter vision models are configured.");
};
