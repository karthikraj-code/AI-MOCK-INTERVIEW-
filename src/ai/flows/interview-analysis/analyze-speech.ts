'use server';

/**
 * @fileOverview Analyzes the recorded video for facial expressions, eye contact, and posture to provide feedback on body language.
 *
 * - analyzeSpeech - A function that handles the analysis of speech from text.
 * - AnalyzeSpeechInput - The input type for the analyzeSpeech function.
 * - AnalyzeSpeechOutput - The return type for the analyzeSpeech function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeSpeechInputSchema = z.object({
  transcription: z
    .string()
    .describe('The transcribed text of the user\'s speech.'),
});
export type AnalyzeSpeechInput = z.infer<typeof AnalyzeSpeechInputSchema>;

const AnalyzeSpeechOutputSchema = z.object({
  clarityScore: z
    .number()
    .describe('A score (0-100) representing the clarity of speech.'),
  fillerWordCount: z
    .number()
    .describe('The number of filler words (e.g., "um", "uh", "like") used.'),
  sentiment: z
    .enum(['positive', 'neutral', 'negative'])
    .describe('The overall sentiment of the speech.'),
  pace: z
    .number()
    .describe('The pace of speech in words per minute.'),
});
export type AnalyzeSpeechOutput = z.infer<typeof AnalyzeSpeechOutputSchema>;

export async function analyzeSpeech(
  input: AnalyzeSpeechInput
): Promise<AnalyzeSpeechOutput> {
  return analyzeSpeechFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSpeechPrompt',
  input: {schema: AnalyzeSpeechInputSchema},
  output: {schema: AnalyzeSpeechOutputSchema},
  prompt: `You are an expert speech analyst specializing in interview performance.

You will analyze the transcribed text of the user's speech and provide feedback on clarity, filler word usage, sentiment, and pace.

Use the following transcription as the primary source of information about the user's speech.

Transcription:
{{{transcription}}}

Based on your analysis, provide a score (0-100) for clarity, a count of filler words, the overall sentiment, and the pace in words per minute. Be succinct and professional in your feedback.
`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const analyzeSpeechFlow = ai.defineFlow(
  {
    name: 'analyzeSpeechFlow',
    inputSchema: AnalyzeSpeechInputSchema,
    outputSchema: AnalyzeSpeechOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
