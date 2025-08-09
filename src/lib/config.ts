// src/lib/config.ts
import "server-only";

/**
 * This file is for securely handling and exporting environment variables 
 * for use in server-side code (like Genkit flows or other API calls).
 * The "server-only" package ensures this module is never accidentally
 * imported into a client-side component.
 */

export const config = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  assemblyAiApiKey: process.env.ASSEMBLYAI_API_KEY,
  deepgramApiKey: process.env.DEEPGRAM_API_KEY,
  // The Gemini API Key is automatically picked up by the googleAI() plugin
  // from the GEMINI_API_KEY environment variable.
};

// You can add validation here to ensure keys are present during startup
if (process.env.NODE_ENV !== 'development') {
    if (!config.openaiApiKey) {
        console.warn("Missing OPENAI_API_KEY. OpenAI-based features will fail.");
    }
    if (!config.assemblyAiApiKey) {
        console.warn("Missing ASSEMBLYAI_API_KEY. AssemblyAI features may fail.");
    }
    if (!config.deepgramApiKey) {
        console.warn("Missing DEEPGRAM_API_KEY. Deepgram features may fail.");
    }
    if (!process.env.GEMINI_API_KEY) {
        console.warn("Missing GEMINI_API_KEY. Google AI features will fail.");
    }
}
