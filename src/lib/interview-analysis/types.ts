import type { AnalyzeBodyLanguageOutput } from "@/ai/flows/interview-analysis/analyze-body-language";
import type { AnalyzeSpeechOutput } from "@/ai/flows/interview-analysis/analyze-speech";

export type FullReport = AnalyzeBodyLanguageOutput & AnalyzeSpeechOutput & {
  transcription: string;
};

export type AnalysisResult = {
  report?: FullReport;
  error?: string;
};
