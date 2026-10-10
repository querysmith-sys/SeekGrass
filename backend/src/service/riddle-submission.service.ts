import { GoogleGenAI } from "@google/genai"
const { GEMINI_API_KEY } = process.env;
if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not defined in the environment variables.");
}
const ai = new GoogleGenAI({
    apiKey: GEMINI_API_KEY
})

export const handleRiddleSubmissionVerification = async (base64String: string, PROMPT: string, riddle: string, mimeType: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: [
                {
                    inlineData: {
                        data: base64String,
                        mimeType: mimeType
                    }
                },
                {
                    text: `
                        Riddle to verify:
                        ${riddle}

                        Analyze the uploaded image against this riddle.
                    `
                },
            ],
            config: {
                systemInstruction: PROMPT,
                responseMimeType: "application/json"
            }
        })
        console.log(response.text);
        return response.text;
    } catch (error: any) {

        const statusCode = error.status || error.code;

        if (statusCode === 429) {
            console.warn("Gemini 3.8 Flash rate limit hit. Activating multimodal fallback...");

            try {

                const responseSecond = await ai.models.generateContent({
                    model: 'gemini-3.5-flash-lite', // Switch to 'gemini-3.6-flash' if you prefer higher reasoning
                    contents: [
                        {
                            inlineData: {
                                data: base64String,
                                mimeType: mimeType
                            }
                        },
                        {
                            text: `
                        Riddle to verify:
                        ${riddle}

                        Analyze the uploaded image against this riddle.
                    `
                        },
                    ],
                    config: {
                        systemInstruction: PROMPT,
                        responseMimeType: "application/json"
                    }
                });

                console.log("Fallback model success:", responseSecond.text);
                return responseSecond.text;

            } catch (fallbackError: any) {
                console.error("Fallback model also failed:", fallbackError);
                throw new Error("Verification service temporarily unavailable. Please try again.");
            }
        }
    }
}