'use server';

/**
 * @fileOverview Analyzes the recorded video for facial expressions, eye contact, and posture to provide feedback on body language.
 *
 * - analyzeBodyLanguage - A function that handles the analysis of body language from video.
 * - AnalyzeBodyLanguageInput - The input type for the analyzeBodyLanguage function.
 * - AnalyzeBodyLanguageOutput - The return type for the analyzeBodyLanguage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeBodyLanguageInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "A video reference: either a public HTTPS URL (recommended), a full data URI, or a raw base64 string."
    ),
});
export type AnalyzeBodyLanguageInput = z.infer<typeof AnalyzeBodyLanguageInputSchema>;

const AnalyzeBodyLanguageOutputSchema = z.object({
  eyeContactScore: z
    .number()
    .describe('A score (0-100) representing the quality of eye contact.'),
  smileRatio: z
    .number()
    .describe(
      'A ratio (0-1) representing the proportion of time the user is smiling.'
    ),
  gestureUsage: z
    .string()
    .describe('A description of the user\'s gesture usage during the interview.'),
  postureAnalysis: z
    .string()
    .describe('An analysis of the user\'s posture during the interview.'),
});
export type AnalyzeBodyLanguageOutput = z.infer<typeof AnalyzeBodyLanguageOutputSchema>;

export async function analyzeBodyLanguage(
  input: AnalyzeBodyLanguageInput
): Promise<AnalyzeBodyLanguageOutput> {
  return analyzeBodyLanguageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeBodyLanguagePrompt',
  input: {schema: AnalyzeBodyLanguageInputSchema},
  output: {schema: AnalyzeBodyLanguageOutputSchema},
  prompt: `You are an expert body language analyst specializing in interview performance.

You will analyze the video of the interview and provide feedback on the user's eye contact, smile ratio, gesture usage, and posture.

Use the following video as the primary source of information about the user's body language.

Video: {{media type="video/webm" url=videoDataUri}}

Based on your analysis, provide a score (0-100) for eye contact, a ratio (0-1) for smile ratio, a description of gesture usage, and an analysis of posture. Be succinct and professional in your feedback.
`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const analyzeBodyLanguageFlow = ai.defineFlow(
  {
    name: 'analyzeBodyLanguageFlow',
    inputSchema: AnalyzeBodyLanguageInputSchema,
    outputSchema: AnalyzeBodyLanguageOutputSchema,
  },
  async input => {
    // Accept either a remote URL or a data URI, or a raw base64 string.
    const videoInput = input.videoDataUri;
    let normalizedVideoReference = videoInput;

    const isHttpUrl = videoInput.startsWith('http://') || videoInput.startsWith('https://');
    const isDataUri = videoInput.startsWith('data:');

    if (!isHttpUrl && !isDataUri) {
      normalizedVideoReference = `data:video/webm;base64,${videoInput}`;
    }

    // Pass through real HTTPS URLs or data URIs directly; do not wrap URLs as data
    const {output} = await prompt({ videoDataUri: normalizedVideoReference });
    return output!;
  }
);
