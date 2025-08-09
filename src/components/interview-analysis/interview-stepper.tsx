'use client';

import { useState, useCallback, useRef } from 'react';
import WelcomeScreen from './welcome-screen';
import InterviewView from './interview-view';
import AnalysisScreen from './analysis-screen';
import ReportView from './report/report-view';
import { useMediaRecorder } from '@/hooks/use-media-recorder';
import { getInterviewAnalysis } from '@/lib/interview-analysis/actions';
import type { AnalysisResult } from '@/lib/interview-analysis/types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const questions = [
  "Can you introduce yourself briefly?",
  "Why did you choose this career path or field of study?",
  "How do you describe yourself in three words, and why?",
  "What is one achievement you're really proud of?",
  "What do you enjoy doing outside of work or studies?",
  "What makes you a good fit for any professional team?",
  "Where do you see yourself in the next 2-3 years?",
  "Tell me about a recent challenge you handled well.",
  "If we give you a chance, how would you add value to our company/team?",
  "What are you currently working on to improve yourself?",
  "What are your greatest strengths?",
  "What is one weakness you are currently working on?",
];

type Step = 'welcome' | 'interviewing' | 'analyzing' | 'report' | 'error';

export default function InterviewStepper() {
  const [step, setStep] = useState<Step>('welcome');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();
  
  const handleChunk = (chunk: string) => {
    // This function can be used for real-time processing if needed in the future.
  };

  const { 
    isRecording, 
    error: mediaError, 
    startRecording, 
    stopRecording, 
    cleanup, 
    isReady,
    stream,
    status
  } = useMediaRecorder(handleChunk);

  const handleStart = async () => {
    // Request permissions and start recording immediately when user clicks start
    await startRecording();
    setStep('interviewing');
  };

  const handleNext = () => {
    if (questionIndex < questions.length - 1) {
      setQuestionIndex(prev => prev + 1);
    }
  };

  const handleFinish = async () => {
    setStep('analyzing');
    const dataUri = await stopRecording();
    
    if (!dataUri) {
        toast({
            title: "Recording Failed",
            description: "Could not get the recorded video. Please try again.",
            variant: "destructive",
        });
        setStep('error');
        return;
    }

    const result = await getInterviewAnalysis(dataUri);
    setAnalysisResult(result);

    if (result.error) {
        toast({
            title: "Analysis Failed",
            description: result.error,
            variant: "destructive",
        });
        setStep('error');
    } else {
        setStep('report');
    }
  };
  
  const handleRetry = useCallback(() => {
    cleanup();
    setStep('welcome');
    setQuestionIndex(0);
    setAnalysisResult(null);
  }, [cleanup]);

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStart={handleStart} />;
      case 'interviewing':
        return (
          <InterviewView
            question={questions[questionIndex]}
            questionIndex={questionIndex}
            totalQuestions={questions.length}
            onNext={handleNext}
            onFinish={handleFinish}
            isReady={isReady}
            isRecording={isRecording}
            stream={stream}
            status={status}
          />
        );
      case 'analyzing':
        return <AnalysisScreen />;
      case 'report':
        if (analysisResult?.report) {
          return <ReportView report={analysisResult.report} onRetry={handleRetry} />;
        }
        // Fallthrough to error if no report
      case 'error':
        return (
            <div className="text-center p-8 bg-card rounded-lg shadow-xl max-w-lg mx-auto">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <h2 className="text-2xl font-bold text-destructive mb-4">An Error Occurred</h2>
                <p className="text-muted-foreground mb-6">{mediaError || analysisResult?.error || 'Something went wrong. Please check permissions and try again.'}</p>
                <Button onClick={handleRetry}>Try Again</Button>
            </div>
        );
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
        {renderStep()}
    </div>
  );
}
