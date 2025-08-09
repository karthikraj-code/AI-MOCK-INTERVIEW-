'use server';

/**
 * @fileOverview A flow for generating daily vocabulary words to help users prepare for job interviews.
 *
 * - getDailyVocabulary - A function that returns 3 new words.
 * - VocabularyWord - The type for a single vocabulary word object.
 * - VocabularyBuilderOutput - The return type for the getDailyVocabulary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VocabularyWordSchema = z.object({
    word: z.string().describe("The vocabulary word."),
    meaning: z.string().describe("A concise definition of the word."),
    example: z.string().describe("An example sentence showing how the word is used in a professional or interview context."),
});
export type VocabularyWord = z.infer<typeof VocabularyWordSchema>;

const VocabularyBuilderOutputSchema = z.object({
  words: z.array(VocabularyWordSchema).length(3).describe('An array of exactly 3 vocabulary words.'),
});
export type VocabularyBuilderOutput = z.infer<typeof VocabularyBuilderOutputSchema>;

export async function getDailyVocabulary(): Promise<VocabularyBuilderOutput> {
  return vocabularyBuilderFlow();
}

const prompt = ai.definePrompt({
  name: 'vocabularyBuilderPrompt',
  output: {schema: VocabularyBuilderOutputSchema},
  prompt: `You are an AI language coach. Your task is to generate exactly three new, useful vocabulary words that would be beneficial for someone preparing for a job interview.
  
  For each word, provide the word itself, a concise meaning, and a simple example sentence that shows its use in a professional context.
  
  The words should be moderately advanced but practical for everyday business communication. Avoid overly obscure or technical jargon unless it's broadly applicable.
  
  Your response MUST be a JSON object containing a key "words" which is an array of 3 word objects.`,
  model: 'googleai/gemini-1.5-flash',
});

const vocabularyBuilderFlow = ai.defineFlow(
  {
    name: 'vocabularyBuilderFlow',
    outputSchema: VocabularyBuilderOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
