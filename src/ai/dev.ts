'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/generate-improvement-feedback.ts';
import '@/ai/flows/question-generator.ts';
import '@/ai/flows/personalized-learning-plan.ts';
import '@/ai/flows/answer-evaluator.ts';
import '@/ai/flows/generate-audio.ts';
import '@/ai/flows/interview-analysis/analyze-body-language.ts';
import '@/ai/flows/interview-analysis/transcribe-audio.ts';
import '@/ai/flows/interview-analysis/analyze-speech.ts';
import '@/ai/flows/technical-interview-flow.ts';
import '@/ai/flows/grade-speech.ts';
import '@/ai/flows/vocabulary-builder.ts';
import '@/ai/flows/resume-analyzer.ts';
import '@/ai/flows/chatbot-flow.ts';
