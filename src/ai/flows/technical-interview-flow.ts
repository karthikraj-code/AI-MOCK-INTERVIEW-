'use server';
/**
 * @fileOverview A flow for conducting a mock technical interview.
 *
 * - generateTechnicalQuestion - A function that generates a technical interview question.
 * - GenerateTechnicalQuestionInput - The input type for the generateTechnicalQuestion function.
 * - GenerateTechnicalQuestionOutput - The return type for the generateTechnicalQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PreviousQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
  evaluation: z.string().describe('Feedback on how well the user answered the previous question.'),
});

const GenerateTechnicalQuestionInputSchema = z.object({
  topic: z.enum(['dsa', 'dbms', 'os', 'cn', 'oops']).describe("The technical topic selected by the user."),
  experienceLevel: z.enum(['intern', 'junior', 'senior']).describe("The user's experience level."),
  previousQuestions: z.array(PreviousQuestionSchema).optional().describe("A history of questions already asked, with the user's answers and evaluations."),
});
export type GenerateTechnicalQuestionInput = z.infer<
  typeof GenerateTechnicalQuestionInputSchema
>;

const GenerateTechnicalQuestionOutputSchema = z.object({
  question: z.string().describe('The new technical question to ask the user.'),
  followUp: z.string().optional().describe('An optional follow-up question or thought to probe deeper.'),
  feedback: z.string().optional().describe('Feedback on the last provided answer. This should be null for the first question.')
});
export type GenerateTechnicalQuestionOutput = z.infer<
  typeof GenerateTechnicalQuestionOutputSchema
>;

export async function generateTechnicalQuestion(
  input: GenerateTechnicalQuestionInput
): Promise<GenerateTechnicalQuestionOutput> {
  return generateTechnicalQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTechnicalQuestionPrompt',
  input: {schema: GenerateTechnicalQuestionInputSchema},
  output: {schema: GenerateTechnicalQuestionOutputSchema},
  prompt: `You are an expert technical interviewer at a top tech company like Google or Amazon. Your persona is that of a seasoned Senior Software Development Engineer (SDE). You are interviewing a candidate for a role that matches their stated experience level.

Your task is to generate ONE technical interview question at a time. The question's difficulty must adapt based on the candidate's performance on previous questions.

**Candidate Profile:**
- Topic: {{{topic}}}
- Experience Level: {{{experienceLevel}}}

**Interview History:**
{{#if previousQuestions}}
  {{#each previousQuestions}}
  - Question: {{{this.question}}}
  - Candidate's Answer: {{{this.answer}}}
  - Your Evaluation: {{{this.evaluation}}}
  {{/each}}
{{else}}
  No questions have been asked yet.
{{/if}}

**Your Instructions:**

1.  **First Question:** If 'previousQuestions' is empty, ask a foundational, medium-difficulty question based on the topic and experience level. The 'feedback' field in your output must be null.
2.  **Adaptive Questioning:**
    - If the candidate's last answer was strong (based on the evaluation), ask a harder question.
    - If the last answer was weak, ask a slightly easier question or a question that clarifies a concept from the previous one.
    - If the last answer was okay, ask a question of similar difficulty but perhaps on a related sub-topic.
3.  **Generate Real-time Feedback:** Based on the most recent answer in the history, provide brief, constructive feedback. Behave like a real interviewer: point out what was good and what could be improved. For example: "Good start, but you missed the edge case where..." or "Excellent explanation of the time complexity."
4.  **Generate One Question Only:** Your main output should be a single, clear technical question.
5.  **Optional Follow-up:** You can provide a short follow-up question to keep in reserve, which the system might use.

Your response must be in a JSON object format.
`,
  model: 'googleai/gemini-1.5-flash',
});

const generateTechnicalQuestionFlow = ai.defineFlow(
  {
    name: 'generateTechnicalQuestionFlow',
    inputSchema: GenerateTechnicalQuestionInputSchema,
    outputSchema: GenerateTechnicalQuestionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
