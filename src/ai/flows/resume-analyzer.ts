
'use server';

/**
 * @fileOverview An AI flow for analyzing a user's resume against a specific job role.
 *
 * - analyzeResume - A function that handles the resume analysis process.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeText: z.string().describe("The full text content of the user's resume."),
  jobRole: z.string().describe('The target job role the user is applying for.'),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  weaknesses: z.array(z.string()).describe("A list of key weaknesses or missing elements in the resume."),
  suggestions: z.array(z.string()).describe("A list of actionable suggestions for improving bullet points, skills, or overall presentation."),
  rewritten_summary: z.string().optional().describe("A rewritten, more impactful summary section if the original was too vague or weak. Null if the original is good."),
  recommendation_score: z.number().min(0).max(10).describe("An overall score from 0-10 indicating how well the resume is aligned with the target job role."),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(input: AnalyzeResumeInput): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumeAnalyzerPrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are a professional career coach and an expert technical recruiter at a top tech company. Your task is to review the provided resume content for a specific job role and provide a detailed, constructive analysis.

  **Target Job Role:**
  {{{jobRole}}}

  **Resume Content:**
  {{{resumeText}}}

  **Your Analysis Must Include:**

  1.  **Key Weaknesses:** Identify the top 3-4 most critical weaknesses or missing elements in the resume. Be specific. Examples: "Lacks quantifiable metrics," "The summary is too generic," "Skills section is missing key technologies for this role."
  2.  **Improvement Suggestions:** Provide concrete, actionable suggestions for improving the resume. Focus on making bullet points more impactful (e.g., using the STAR method), adding relevant keywords, and better tailoring the resume to the job role.
  3.  **Rewritten Summary:** If the candidate's summary/objective section is weak, vague, or missing, write a concise and powerful professional summary for them. If the existing summary is good, return null for this field.
  4.  **Recommendation Score:** Provide an overall score from 0 (very poor) to 10 (excellent) that reflects how well the resume is aligned with the target job role and how likely it is to pass an initial screening.

  Your response MUST be a JSON object that strictly follows the defined output schema.
  `,
  model: 'googleai/gemini-1.5-flash',
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
