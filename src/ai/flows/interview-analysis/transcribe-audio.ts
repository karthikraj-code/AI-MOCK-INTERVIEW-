'use server';

/**
 * @fileOverview A flow to transcribe audio files into text.
 *
 * - transcribeAudio - A function that handles the audio transcription process.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "The recorded interview session audio, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text of the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioPrompt = ai.definePrompt({
  name: 'transcribeAudioPrompt',
  input: {schema: TranscribeAudioInputSchema},
  output: {schema: TranscribeAudioOutputSchema},
  prompt: `Transcribe the following audio into text.\n\nAudio: {{media url=audioDataUri}}`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    // Validate and clean the base64 data
    const audioDataUri = input.audioDataUri;
    let cleanAudioDataUri = audioDataUri;
    
    // Ensure proper data URI format
    if (!audioDataUri.startsWith('data:')) {
      cleanAudioDataUri = `data:video/webm;base64,${audioDataUri}`;
    }
    
    const {output} = await transcribeAudioPrompt({ audioDataUri: cleanAudioDataUri });
    return output!;
  }
);
