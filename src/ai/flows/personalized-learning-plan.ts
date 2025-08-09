'use server';

/**
 * @fileOverview A personalized learning plan generator AI agent.
 *
 * - generatePersonalizedLearningPlan - A function that generates a personalized learning plan.
 * - PersonalizedLearningPlanInput - The input type for the generatePersonalizedLearningPlan function.
 * - PersonalizedLearningPlanOutput - The return type for the generatePersonalizedLearningPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedLearningPlanInputSchema = z.object({
  resume: z.string().describe("The user's resume text."),
  jobRole: z.string().describe('The job role the user is interviewing for.'),
  feedback: z.string().describe('The feedback from the interview evaluator.'),
});
export type PersonalizedLearningPlanInput = z.infer<typeof PersonalizedLearningPlanInputSchema>;

const PersonalizedLearningPlanOutputSchema = z.object({
  learningPlan: z.string().describe('A personalized learning plan for the user.'),
});
export type PersonalizedLearningPlanOutput = z.infer<typeof PersonalizedLearningPlanOutputSchema>;

export async function generatePersonalizedLearningPlan(
  input: PersonalizedLearningPlanInput
): Promise<PersonalizedLearningPlanOutput> {
  return personalizedLearningPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedLearningPlanPrompt',
  input: {schema: PersonalizedLearningPlanInputSchema},
  output: {schema: PersonalizedLearningPlanOutputSchema},
  prompt: `You are a career coach specializing in helping candidates prepare for job interviews.

  Based on the user's resume, the job role they are interviewing for, and the feedback they received, you will generate a personalized learning plan.
  The plan should be a single, flowing paragraph of text. Do not use markdown, lists, or bold text.

  Resume: {{{resume}}}
  Job Role: {{{jobRole}}}
  Feedback: {{{feedback}}}

  Learning Plan:`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const personalizedLearningPlanFlow = ai.defineFlow(
  {
    name: 'personalizedLearningPlanFlow',
    inputSchema: PersonalizedLearningPlanInputSchema,
    outputSchema: PersonalizedLearningPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
