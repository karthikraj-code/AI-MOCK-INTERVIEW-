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
  videoDataUri: string // This will be the full video for context, chunks are handled internally
): Promise<AnalysisResult> {
  if (!videoDataUri) {
    return { error: 'No video data received.' };
  }

  try {
    // Sanitize the base64 data to ensure it's clean for the AI API
    const sanitizedVideoData = sanitizeBase64Data(videoDataUri);
    
    // Create proper data URIs with sanitized base64 data
    const videoDataUriClean = `data:video/webm;base64,${sanitizedVideoData}`;
    
    // The main idea of chunking would be to get an array of data URIs.
    // For this implementation, we will simulate the parallel nature
    // by calling the existing flows but acknowledging this is where
    // the logic for handling multiple chunks would go.

    const [bodyLanguagePromise, transcriptionPromise] = [
      analyzeBodyLanguage({ videoDataUri: videoDataUriClean }),
      transcribeAudio({ audioDataUri: videoDataUriClean })
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
