'use server';

/**
 * @fileOverview A flow for generating personalized improvement suggestions based on an interview evaluation.
 *
 * - generateImprovementFeedback - A function that generates personalized improvement suggestions.
 * - GenerateImprovementFeedbackInput - The input type for the generateImprovementFeedback function.
 * - GenerateImprovementFeedbackOutput - The return type for the generateImprovementFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImprovementFeedbackInputSchema = z.object({
  feedback: z.string().describe('The detailed feedback from the interview evaluation.'),
  scores: z.object({
    communication: z.number().describe('The score for communication skills.'),
    technical: z.number().describe('The score for technical skills.'),
    confidence: z.number().describe('The score for confidence level.'),
  }).describe('The scores from the interview evaluation.'),
  jobRole: z.string().describe('The job role the candidate was interviewed for.'),
});
export type GenerateImprovementFeedbackInput = z.infer<typeof GenerateImprovementFeedbackInputSchema>;

const GenerateImprovementFeedbackOutputSchema = z.object({
  improvementSuggestions: z.string().describe('Personalized suggestions for improvement based on the feedback and scores.'),
});
export type GenerateImprovementFeedbackOutput = z.infer<typeof GenerateImprovementFeedbackOutputSchema>;

export async function generateImprovementFeedback(input: GenerateImprovementFeedbackInput): Promise<GenerateImprovementFeedbackOutput> {
  return generateImprovementFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateImprovementFeedbackPrompt',
  input: {schema: GenerateImprovementFeedbackInputSchema},
  output: {schema: GenerateImprovementFeedbackOutputSchema},
  prompt: `You are an AI career coach providing personalized suggestions for improvement based on an interview evaluation.

  Based on the following interview feedback, scores, and job role, generate personalized and actionable suggestions for improvement.

  Interview Feedback: {{{feedback}}}
  Scores: 
    Communication: {{{scores.communication}}}
    Technical: {{{scores.technical}}}
    Confidence: {{{scores.confidence}}}
  Job Role: {{{jobRole}}}

  Provide specific and practical advice that the candidate can use to improve their skills and performance in future interviews.
  Focus on areas where the candidate can realistically make improvements. Suggest areas to study and resources that might be helpful.
  Your response should only include the improvement suggestions, formatted as a single, flowing paragraph. Do not use markdown, lists, or bold text.
  `,
  model: 'googleai/gemini-1.5-flash-latest',
});

const generateImprovementFeedbackFlow = ai.defineFlow(
  {
    name: 'generateImprovementFeedbackFlow',
    inputSchema: GenerateImprovementFeedbackInputSchema,
    outputSchema: GenerateImprovementFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
