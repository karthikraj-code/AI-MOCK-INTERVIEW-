
'use server';

/**
 * @fileOverview Analyzes a user's speech for clarity, grammar, and vocabulary, providing scores and feedback.
 *
 * - gradeSpeech - A function that handles the speech grading process.
 * - GradeSpeechInput - The input type for the gradeSpeech function.
 * - GradeSpeechOutput - The return type for the gradeSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GradeSpeechInputSchema = z.object({
  transcript: z.string().describe("The user's spoken response, transcribed to text."),
});
export type GradeSpeechInput = z.infer<typeof GradeSpeechInputSchema>;

const GradeSpeechOutputSchema = z.object({
    grammarScore: z.number().min(0).max(10).describe("A score from 0-10 for grammatical accuracy."),
    clarityScore: z.number().min(0).max(10).describe("A score from 0-10 for how clear and understandable the speech is."),
    vocabularyScore: z.number().min(0).max(10).describe("A score from 0-10 for the richness and appropriateness of vocabulary used."),
    suggestions: z.array(z.string()).describe("A list of specific, actionable suggestions for improvement. For example: \"Replace 'I done it' with 'I did it'\" or \"Instead of 'very good', consider using 'exceptional' or 'outstanding'.\""),
});
export type GradeSpeechOutput = z.infer<typeof GradeSpeechOutputSchema>;

export async function gradeSpeech(input: GradeSpeechInput): Promise<GradeSpeechOutput> {
  return gradeSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeSpeechPrompt',
  input: {schema: GradeSpeechInputSchema},
  output: {schema: GradeSpeechOutputSchema},
  prompt: `You are an expert English language coach, specializing in interview communication.
  
  Your task is to analyze the provided transcript of a user's spoken response. Evaluate it based on three criteria: grammar, clarity, and vocabulary.
  
  1.  **Grammar:** Assess the grammatical accuracy.
  2.  **Clarity:** Evaluate how clear, concise, and easy to understand the response is. Consider the tone and filler words.
  3.  **Vocabulary:** Judge the strength and appropriateness of the words used. Are they professional? Is there variety?
  
  For each of the three criteria, provide a score from 0 (very poor) to 10 (excellent).
  
  Most importantly, provide a list of concrete, actionable suggestions for improvement. These suggestions should be specific.
  - If you find a grammar mistake, provide the correction. (e.g., "Replace 'I done it' with 'I did it'.")
  - If you notice weak vocabulary, suggest stronger alternatives. (e.g., "Instead of 'very good', you could say 'exceptional' or 'outstanding'.")
  - If you see overuse of filler words, point it out. (e.g., "Try to reduce the use of words like 'basically' or 'like'.")
  
  Transcript to analyze:
  "{{{transcript}}}"
  
  Your response MUST be a JSON object matching the defined schema.`,
  model: 'googleai/gemini-1.5-flash',
});

const gradeSpeechFlow = ai.defineFlow(
  {
    name: 'gradeSpeechFlow',
    inputSchema: GradeSpeechInputSchema,
    outputSchema: GradeSpeechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
