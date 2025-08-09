'use server';

/**
 * @fileOverview Evaluates user answers in a mock interview, providing feedback on communication, technical skills, and confidence.
 *
 * - evaluateAnswer - A function that handles the answer evaluation process.
 * - EvaluateAnswerInput - The input type for the evaluateAnswer function.
 * - EvaluateAnswerOutput - The return type for the evaluateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateAnswerInputSchema = z.object({
  question: z.string().describe('The interview question asked.'),
  answer: z.string().describe('The user provided answer.'),
  jobRole: z.string().describe('The job role for which the interview is being conducted.'),
  resume: z.string().describe('The user resume.'),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

const EvaluateAnswerOutputSchema = z.object({
  communication: z.number().describe('Score for communication skills (0-10).'),
  technical: z.number().describe('Score for technical skills (0-10).'),
  confidence: z.number().describe('Score for confidence level (0-10).'),
  feedback: z.string().describe('Detailed feedback on the answer, including areas for improvement.'),
});
export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutputSchema>;

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<EvaluateAnswerOutput> {
  return evaluateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerEvaluatorPrompt',
  input: {schema: EvaluateAnswerInputSchema},
  output: {schema: EvaluateAnswerOutputSchema},
  prompt: `You are an expert interview evaluator providing feedback to candidates.

  Evaluate the candidate's answer to the interview question based on their communication skills, technical skills, and confidence level.
  Provide a score (0-10) for each of these areas, and give detailed feedback explaining the score.

  Consider the job role and the candidate's resume when evaluating the answer.

  Job Role: {{{jobRole}}}
  Resume: {{{resume}}}
  Question: {{{question}}}
  Answer: {{{answer}}}

  Format your output as a JSON object with the following keys:
  - communication: (number) Score for communication skills (0-10).
  - technical: (number) Score for technical skills (0-10).
  - confidence: (number) Score for confidence level (0-10).
  - feedback: (string) Detailed feedback on the answer, including areas for improvement.
  `,
  model: 'googleai/gemini-1.5-flash-latest',
});

const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
