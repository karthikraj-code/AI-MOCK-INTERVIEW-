/**
 * @fileOverview Initializes and configures the Genkit AI instance.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { config } from '@/lib/config';

export const ai = genkit({
  plugins: [
    googleAI({
      models: [
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
      ],
    }),
  ],
});