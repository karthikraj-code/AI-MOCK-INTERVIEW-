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
      "An audio/video reference: either a public HTTPS URL (recommended), a full data URI, or a raw base64 string."
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
  prompt: `Transcribe the following audio into text.\n\nAudio: {{media type="video/webm" url=audioDataUri}}`,
  model: 'googleai/gemini-1.5-flash-latest',
});

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async input => {
    // Accept either a remote URL or a data URI, or a raw base64 string.
    const audioInput = input.audioDataUri;
    let normalizedAudioReference = audioInput;

    const isHttpUrl = audioInput.startsWith('http://') || audioInput.startsWith('https://');
    const isDataUri = audioInput.startsWith('data:');

    if (!isHttpUrl && !isDataUri) {
      normalizedAudioReference = `data:video/webm;base64,${audioInput}`;
    }

    // Pass through real HTTPS URLs or data URIs directly; do not wrap URLs as data
    const {output} = await transcribeAudioPrompt({ audioDataUri: normalizedAudioReference });
    return output!;
  }
);
