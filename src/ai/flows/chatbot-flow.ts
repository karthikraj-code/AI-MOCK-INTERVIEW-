
'use server';

/**
 * @fileOverview An AI flow for a helpful chatbot assistant.
 *
 * - chatbotFlow - A function that handles the chatbot conversation.
 * - ChatbotInput - The input type for the chatbotFlow function.
 * - ChatbotOutput - The return type for the chatbotFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatbotInputSchema = z.object({
  user_question: z.string().describe("The user's question to the chatbot."),
  section: z.string().describe('The current section of the app the user is in (e.g., "Dashboard", "Aptitude", "Resume Analyzer").'),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The AI's helpful response."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatbotFlow(input: ChatbotInput): Promise<ChatbotOutput> {
  return runChatbotFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatbotPrompt',
  input: {schema: ChatbotInputSchema},
  output: {schema: ChatbotOutputSchema},
  prompt: `You are a helpful and friendly AI Interview Assistant named Career Compass Guide. You help students preparing for campus placements and job interviews.

  The user is currently in the "{/section}" section of the app.
  
  Their question is: "{/user_question}"

  Your task is to:
  1.  Provide a clear, concise, and beginner-friendly answer.
  2.  If the question is complex, break down the answer into structured steps or bullet points.
  3.  If the user's question relates to a specific feature in the app (like Resume Analyzer, Mock Interviews, etc.), gently guide them towards it. For example, if they ask about resumes, you can say "That's a great question! For a detailed analysis, I recommend using the 'Resume Analyzer' tool on the sidebar."
  4.  Maintain a positive and encouraging tone.

  Respond only with the answer. Do not include any greetings or introductory phrases like "Here is the answer:".
  `,
  model: 'googleai/gemini-1.5-flash',
});

const runChatbotFlow = ai.defineFlow(
  {
    name: 'runChatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
