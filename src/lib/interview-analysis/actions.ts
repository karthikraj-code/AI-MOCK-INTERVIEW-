'use server';

import { analyzeBodyLanguage } from '@/ai/flows/interview-analysis/analyze-body-language';
import { analyzeSpeech } from '@/ai/flows/interview-analysis/analyze-speech';
import { transcribeAudio } from '@/ai/flows/interview-analysis/transcribe-audio';
import type { AnalysisResult } from '@/lib/interview-analysis/types';

// Utility function to sanitize and validate base64 data from data URIs
function sanitizeBase64Data(dataUri: string): string {
  try {
    // Check if it's a data URI and extract the base64 part
    if (dataUri.startsWith('data:')) {
      const base64Index = dataUri.indexOf('base64,');
      if (base64Index !== -1) {
        return dataUri.substring(base64Index + 7);
      }
    }
    
    // If not a data URI, assume it's already base64
    return dataUri;
  } catch (error) {
    throw new Error('Invalid data format provided');
  }
}

// This function processes chunks in parallel and combines the results.
export async function getInterviewAnalysis(
  videoReference: string // Cloud URL (preferred) or data URI or raw base64
): Promise<AnalysisResult> {
  if (!videoReference) {
    return { error: 'No video data received.' };
  }

  try {
    const isHttpUrl = videoReference.startsWith('http://') || videoReference.startsWith('https://');
    const isDataUri = videoReference.startsWith('data:');
    // Build a safe reference for the AI media placeholder
    const videoForAi = isHttpUrl || isDataUri
      ? videoReference
      : `data:video/webm;base64,${sanitizeBase64Data(videoReference)}`;
    
    // The main idea of chunking would be to get an array of data URIs.
    // For this implementation, we will simulate the parallel nature
    // by calling the existing flows but acknowledging this is where
    // the logic for handling multiple chunks would go.

    const [bodyLanguagePromise, transcriptionPromise] = [
      analyzeBodyLanguage({ videoDataUri: videoForAi }),
      transcribeAudio({ audioDataUri: videoForAi })
    ];

    const transcriptionResult = await transcriptionPromise;
    if (!transcriptionResult.transcription) {
      return { error: 'Could not understand audio. Please try again.' };
    }
    
    const speechPromise = analyzeSpeech({ transcription: transcriptionResult.transcription });

    const [bodyLanguageResult, speechResult] = await Promise.all([
      bodyLanguagePromise,
      speechPromise,
    ]);

    return {
      report: {
        ...bodyLanguageResult,
        ...speechResult,
        transcription: transcriptionResult.transcription,
      }
    };
  } catch (e) {
    console.error('Error during interview analysis:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    return { error: `An unexpected error occurred during analysis: ${errorMessage}. Please try again.` };
  }
}
