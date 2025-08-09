/**
 * @fileOverview Initializes and aiconfigures the Genkit AI instance.
 */

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import {config} from '@/lib/config';

export const ai = genkit({
  plugins: [
    googleAI(), // Automatically uses the GEMINI_API_KEY from .env
  ],
});
