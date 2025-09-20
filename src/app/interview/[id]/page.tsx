"use client";

// Add global SpeechRecognition type for TypeScript
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
  // Minimal SpeechRecognition type definition
  var SpeechRecognition: {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  };
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
    onend: ((this: SpeechRecognition, ev: Event) => any) | null;
    onerror: ((this: SpeechRecognition, ev: any) => any) | null;
    onresult: ((this: SpeechRecognition, ev: any) => any) | null;
    resultIndex?: number;
    results?: any;
  }
}

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, MicOff, Send, Volume2, User as UserIcon, Sparkles, Brain, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { evaluateAnswer, EvaluateAnswerOutput } from "@/ai/flows/answer-evaluator";
import { generateAudio, GenerateAudioOutput } from "@/ai/flows/generate-audio";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type InterviewData = {
  jobRole: string;
  resume: string;
  questions: string[];
  answers: string[];
  evaluations: EvaluateAnswerOutput[];
};

// Floating animation component
const FloatingElement = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  return (
    <div 
      className={`animate-float ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default function InterviewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const interviewId = params.id as string;
  
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isEvaluating, startEvaluationTransition] = useTransition();
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Timer state
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start timer
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const data = localStorage.getItem(`interview_${interviewId}`);
    if (data) {
      setInterviewData(JSON.parse(data));
    } else {
      toast({
        variant: "destructive",
        title: "Interview not found",
        description: "Could not find the interview data. Please start a new one.",
      });
      router.push('/interview/setup');
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event) => {
        setIsRecording(false);
        toast({ variant: "destructive", title: "Recording Error", description: event.error });
      };
      
      let finalTranscript = '';
      recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setAnswer(finalTranscript + interimTranscript);
      };
      recognitionRef.current = recognition;
    }

  }, [interviewId, router, toast]);

  const handlePlayQuestion = async () => {
    if (!interviewData || isGeneratingAudio) return;
    
    setIsGeneratingAudio(true);
    try {
      const questionText = interviewData.questions[currentQuestionIndex];
      const result: GenerateAudioOutput = await generateAudio({ text: questionText });
      if (audioPlayerRef.current && result.audioUrl) {
          audioPlayerRef.current.src = result.audioUrl;
          audioPlayerRef.current.play();
      }
    } catch (error) {
      console.error("Audio generation error:", error);
      toast({
        variant: "destructive",
        title: "Could not play audio",
        description: "There was an error generating the audio for the question.",
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleSubmit = async () => {
    if (!answer.trim()) {
      toast({
        variant: "destructive",
        title: "Empty Answer",
        description: "Please provide an answer before submitting.",
      });
      return;
    }
    
    startEvaluationTransition(async () => {
      if (!interviewData) return;

      const evaluation = await evaluateAnswer({
        question: interviewData.questions[currentQuestionIndex],
        answer,
        jobRole: interviewData.jobRole,
        resume: interviewData.resume,
      });

      const updatedData: InterviewData = {
        ...interviewData,
        answers: [...(interviewData.answers || []), answer],
        evaluations: [...(interviewData.evaluations || []), evaluation],
      };
      
      localStorage.setItem(`interview_${interviewId}`, JSON.stringify(updatedData));
      setInterviewData(updatedData);
      setAnswer("");

      const isLastQuestion = currentQuestionIndex === interviewData.questions.length - 1;

      if (isLastQuestion) {
        toast({
          title: "Interview Complete!",
          description: "Analyzing your answers and generating your results...",
        });
        router.push(`/interview/${interviewId}/results`);
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Reset timer for next question
        setElapsedTime(0);
      }
    });
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
       toast({
        variant: "destructive",
        title: "Browser not supported",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!interviewData) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-screen">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse scale-150"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-full p-6">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            </div>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading Interview...
            </h2>
          </div>
        </main>
      </AppLayout>
    );
  }

  const progress = ((currentQuestionIndex) / interviewData.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === interviewData.questions.length - 1;
  const isPending = isEvaluating || isGeneratingAudio;

  return (
    <AppLayout>
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(0.33); opacity: 1; }
          80%, 100% { transform: scale(2.33); opacity: 0; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes typing {
          0%, 50% { border-color: transparent; }
          51%, 100% { border-color: #3b82f6; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-pulse-ring {
          animation: pulse-ring 2s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        }
        
        .gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b);
          background-size: 400% 400%;
          animation: gradient-shift 4s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .card-3d {
          transform-style: preserve-3d;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .card-3d:hover {
          transform: translateY(-5px) rotateX(2deg);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
        }
        
        .interviewer-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .response-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(226, 232, 240, 0.5);
        }
        
        .recording-pulse {
          position: relative;
        }
        
        .recording-pulse::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, #ef4444, #f97316);
          border-radius: inherit;
          animation: pulse-ring 2s infinite;
          z-index: -1;
        }
        
        .typing-indicator {
          border-right: 2px solid;
          animation: typing 1s infinite;
        }
        
        .shimmer-effect {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer-effect::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
          animation: shimmer 2s infinite;
        }
        
        .progress-glow {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
        }
      `}</style>

      <main className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-screen relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 -z-10"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl -z-10"></div>

        <FloatingElement delay={0} className="w-full max-w-6xl">
          <Card className="w-full card-3d animate-in fade-in-50 duration-500 grid md:grid-cols-2 border-0 shadow-2xl overflow-hidden">
            {/* Interviewer Side */}
            <div className="p-8 flex flex-col items-center justify-center interviewer-card relative">
              {/* Status indicators */}
              <div className="absolute top-6 left-6 flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">{formatTime(elapsedTime)}</span>
                </div>
                <div className="px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium">
                  Q{currentQuestionIndex + 1}/{interviewData.questions.length}
                </div>
              </div>

              {/* AI Avatar */}
              <FloatingElement delay={200} className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 scale-110"></div>
                <Avatar className="w-56 h-56 border-4 border-white/30 shadow-2xl relative z-10 ring-4 ring-blue-500/20">
                  <AvatarImage 
                    src="https://img.freepik.com/premium-photo/men-grey-sharp-attractive-eye-grey-dress_1000150-864.jpg" 
                    alt="AI Interviewer" 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Brain className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                {isGeneratingAudio && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-64 h-64 border-4 border-blue-500/30 rounded-full animate-pulse-ring"></div>
                  </div>
                )}
              </FloatingElement>

              {/* Question Display */}
              <div className="w-full space-y-4">
                <div className="flex items-center gap-2 text-center justify-center mb-4">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-lg font-semibold gradient-text">AI Interviewer</span>
                  <Sparkles className="h-5 w-5 text-purple-600" />
                </div>
                
                <div className="p-6 bg-white/40 backdrop-blur-sm border border-white/30 rounded-2xl shadow-lg relative overflow-hidden shimmer-effect">
                  <div className="flex items-start gap-4">
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={handlePlayQuestion} 
                      disabled={isGeneratingAudio}
                      className="flex-shrink-0 hover:bg-white/20 transition-all duration-300"
                    >
                      {isGeneratingAudio ? (
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      ) : (
                        <Volume2 className="h-6 w-6 text-blue-600" />
                      )}
                    </Button>
                    <p className="text-lg font-medium leading-relaxed text-gray-800 flex-1">
                      {interviewData.questions[currentQuestionIndex]}
                    </p>
                  </div>
                </div>
              </div>

              <audio ref={audioPlayerRef} className="hidden" />
            </div>

            {/* Response Side */}
            <div className="p-8 response-card relative">
              <CardHeader className="px-0 pt-0 pb-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold gradient-text">
                      Your Response
                    </CardTitle>
                    <CardDescription className="text-base flex items-center gap-2">
                      <UserIcon className="h-4 w-4" />
                      Record or type your answer below
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-all duration-300"
                      >
                        End Interview
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-0 shadow-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">End Interview?</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          Your progress will be lost and you will be returned to the dashboard.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Continue Interview</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => router.push('/dashboard')} 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          End Interview
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Progress</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress 
                    value={progress} 
                    className="progress-glow h-3 bg-gray-200" 
                  />
                </div>
              </CardHeader>

              <CardContent className="space-y-6 px-0 pb-0">
                <div className="space-y-6">
                  {/* Answer Input */}
                  <div className="relative">
                    <Textarea
                      placeholder="Your answer will appear here as you speak or type..."
                      className={`min-h-[240px] text-base border-2 transition-all duration-300 resize-none ${
                        answer ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'
                      } ${isRecording ? 'typing-indicator' : ''}`}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      disabled={isPending}
                    />
                    {isRecording && (
                      <div className="absolute top-4 right-4">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-200 rounded-full">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-red-700">Recording...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={toggleRecording} 
                      disabled={isPending || isEvaluating}
                      className={`flex-1 h-12 text-base font-medium transition-all duration-300 ${
                        isRecording 
                          ? 'recording-pulse bg-red-50 border-red-300 text-red-700 hover:bg-red-100' 
                          : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <MicOff className="mr-2 h-5 w-5" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="mr-2 h-5 w-5" />
                          Record Answer
                        </>
                      )}
                    </Button>

                    <Button 
                      onClick={handleSubmit} 
                      disabled={isPending || !answer.trim()}
                      className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                    >
                      {isEvaluating ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-5 w-5" />
                          {isLastQuestion ? "Complete Interview" : "Submit & Continue"}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Word count and tips */}
                <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-200">
                  <span>{answer.trim().split(/\s+/).filter(word => word.length > 0).length} words</span>
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>Tip: Be specific and provide examples</span>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>
        </FloatingElement>
      </main>
    </AppLayout>
  );
}