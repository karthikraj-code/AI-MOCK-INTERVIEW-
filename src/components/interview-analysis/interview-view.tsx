'use client';

import { Button } from '@/components/ui/button';
import { useEffect, useRef, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Mic, Volume2, Video, MicOff, Loader2, Timer, VideoOff } from 'lucide-react';
import type { RecorderStatus } from '@/hooks/use-media-recorder';


type InterviewViewProps = {
  question: string;
  questionIndex: number;
  totalQuestions: number;
  onNext: () => void;
  onFinish: () => void;
  isReady: boolean;
  isRecording: boolean;
  stream: MediaStream | null;
  status: RecorderStatus;
};

const INTERVIEW_DURATION = 15 * 60; // 15 minutes in seconds

export default function InterviewView({ 
  question, 
  questionIndex, 
  totalQuestions, 
  onNext, 
  onFinish, 
  isReady, 
  isRecording,
  stream,
  status
}: InterviewViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);
  const isLastQuestion = questionIndex === totalQuestions - 1;

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (!isRecording) return;

    const timer = setInterval(() => {
        setTimeLeft(prevTime => {
            if (prevTime <= 1) {
                clearInterval(timer);
                onFinish();
                return 0;
            }
            return prevTime - 1;
        });
    }, 1000);

    return () => clearInterval(timer);
}, [isRecording, onFinish]);

  
  const speakQuestion = () => {
    if ('speechSynthesis' in window && question) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(question);
      window.speechSynthesis.speak(utterance);
    }
  };
  
  useEffect(() => {
      setIsAnswering(false);
      if(isReady) {
          speakQuestion();
      }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question, isReady]);

  const handleAnswerToggle = () => {
      setIsAnswering(prev => !prev);
  }

  const handleNextOrFinish = () => {
      if(isLastQuestion) {
          onFinish();
      } else {
          onNext();
      }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const renderContent = () => {
    if (status === 'permission-requested') {
      return (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-8 h-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h2 className="text-xl font-semibold">Requesting Camera Access</h2>
            <p className="text-muted-foreground">Please allow access to your camera and microphone in the browser prompt.</p>
        </div>
      )
    }

    // Always render video tag to prevent race conditions on stream assignment
    return (
        <>
            <video ref={videoRef} className="w-full h-full object-cover scale-x-[-1]" autoPlay muted playsInline />
            {status === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                    <Alert variant="destructive" className="w-auto">
                        <Video className="h-4 w-4" />
                        <AlertTitle>Camera Not Found</AlertTitle>
                        <AlertDescription>
                            Please allow camera access and refresh.
                        </AlertDescription>
                    </Alert>
                </div>
            )}
            <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                <Timer className="h-4 w-4" />
                <span>{formatTime(timeLeft)}</span>
            </div>
            {isRecording && (
                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-destructive/80 text-destructive-foreground px-3 py-1 rounded-full text-sm">
                    <Mic className="h-4 w-4 animate-pulse" />
                    <span>Recording Entire Session...</span>
                </div>
            )}
        </>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col items-center gap-6 animate-fade-in">
      <div className="w-full aspect-video bg-card rounded-lg overflow-hidden shadow-lg border relative">
        {renderContent()}
      </div>
      <div className="text-center p-6 bg-card rounded-lg shadow-lg border w-full">
        <p className="text-sm font-semibold text-primary uppercase tracking-wider">Question {questionIndex + 1} of {totalQuestions}</p>
        <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-6">{question}</h2>
        <div className="flex justify-center items-center gap-2 md:gap-4 flex-wrap">
          <Button onClick={speakQuestion} variant="outline" size="lg" aria-label="Listen to question again"  disabled={!isReady}>
            <Volume2 className="h-5 w-5" />
          </Button>

          {isAnswering ? (
              <Button onClick={handleAnswerToggle} size="lg" variant="secondary" disabled={!isReady}>
                  <MicOff className="mr-2"/> Stop Answering
              </Button>
          ) : (
              <Button onClick={handleAnswerToggle} size="lg" disabled={!isReady}>
                  <Mic className="mr-2"/> Start Answering
              </Button>
          )}

          <Button onClick={handleNextOrFinish} size="lg" disabled={!isReady || isAnswering}>
            {isLastQuestion ? 'Finish & Analyze' : 'Next Question'}
          </Button>

          <Button onClick={onFinish} size="lg" variant="destructive" disabled={!isReady}>
            <VideoOff className="mr-2" /> End Interview
          </Button>
        </div>
        {isAnswering && (
             <p className="text-sm text-muted-foreground mt-4 animate-pulse">Your answer is being recorded...</p>
        )}
      </div>
    </div>
  );
}
