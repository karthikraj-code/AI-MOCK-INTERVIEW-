
"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Loader2, Mic, MicOff, Send, BrainCircuit, BotMessageSquare } from "lucide-react";
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
import { generateTechnicalQuestion, GenerateTechnicalQuestionOutput } from "@/ai/flows/technical-interview-flow";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type TechInterviewData = {
  topic: 'dsa' | 'dbms' | 'os' | 'cn' | 'oops';
  experienceLevel: 'intern' | 'junior' | 'senior';
  history: {
    question: string;
    answer: string;
    evaluation: string;
  }[];
  currentQuestion: string;
};

export default function TechnicalInterviewPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const interviewId = params.id as string;
  
  const [interviewData, setInterviewData] = useState<TechInterviewData | null>(null);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isProcessing, startProcessingTransition] = useTransition();
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const data = localStorage.getItem(`tech_interview_${interviewId}`);
    if (data) {
      const parsedData = JSON.parse(data);
       if (!parsedData.currentQuestion) {
        // First time opening, generate first question
        startProcessingTransition(async () => {
          const res = await generateTechnicalQuestion({
            topic: parsedData.topic,
            experienceLevel: parsedData.experienceLevel,
            previousQuestions: [],
          });
          const updatedData = {...parsedData, currentQuestion: res.question};
          setInterviewData(updatedData);
          localStorage.setItem(`tech_interview_${interviewId}`, JSON.stringify(updatedData));
        });
      } else {
        setInterviewData(parsedData);
      }
    } else {
      toast({
        variant: "destructive",
        title: "Interview not found",
        description: "Could not find the interview data. Please start a new one.",
      });
      router.push('/interview/technical/setup');
    }
    
    // Setup Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
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
        setCurrentAnswer(finalTranscript + interimTranscript);
      };
      recognitionRef.current = recognition;
    }
  }, [interviewId, router, toast]);

  const handleSubmit = async () => {
    if (!currentAnswer.trim() || !interviewData) {
      toast({
        variant: "destructive",
        title: "Empty Answer",
        description: "Please provide an answer.",
      });
      return;
    }
    
    startProcessingTransition(async () => {
      // Create a temporary evaluation for the last answer.
      const tempEvaluation = "Candidate attempted the question.";
      const updatedHistory = [
          ...interviewData.history, 
          { 
              question: interviewData.currentQuestion, 
              answer: currentAnswer, 
              evaluation: tempEvaluation 
          }
      ];
      
      const res = await generateTechnicalQuestion({
        topic: interviewData.topic,
        experienceLevel: interviewData.experienceLevel,
        previousQuestions: updatedHistory,
      });

      const finalHistory = [
        ...interviewData.history,
        {
          question: interviewData.currentQuestion,
          answer: currentAnswer,
          evaluation: res.feedback || "No feedback provided.",
        }
      ];

      const updatedData: TechInterviewData = {
        ...interviewData,
        history: finalHistory,
        currentQuestion: res.question,
      };
      
      setAiFeedback(res.feedback || null);
      localStorage.setItem(`tech_interview_${interviewId}`, JSON.stringify(updatedData));
      setInterviewData(updatedData);
      setCurrentAnswer("");
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

  if (!interviewData || !interviewData.currentQuestion) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-muted-foreground">Generating first question...</p>
            </div>
        </main>
      </AppLayout>
    );
  }

  const progress = (interviewData.history.length / 5) * 100; // Assuming 5 questions per session for now

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-4xl animate-in fade-in-50 duration-500">
          <CardHeader>
              <div className="flex justify-between items-start mb-2">
                  <div>
                      <CardTitle className="flex items-center gap-2"><BrainCircuit /> Mock Technical Interview</CardTitle>
                      <CardDescription className="pt-2">
                        Topic: <Badge>{interviewData.topic.toUpperCase()}</Badge> | Experience: <Badge variant="secondary">{interviewData.experienceLevel}</Badge>
                      </CardDescription>
                  </div>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">End Interview</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to end this session?</AlertDialogTitle>
                        <AlertDialogDescription>
                           Your progress will be saved, and you can review it on your dashboard later.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push('/dashboard')} className="bg-destructive hover:bg-destructive/90">End Session</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                    </AlertDialog>
              </div>
               <Progress value={progress} className="mt-4" />
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <p className="font-semibold">Question {interviewData.history.length + 1}:</p>
                <p className="text-lg">{interviewData.currentQuestion}</p>
              </div>

               {aiFeedback && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-r-md animate-in fade-in-50">
                    <div className="flex items-start gap-3">
                        <BotMessageSquare className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                            <p className="font-semibold text-blue-800 dark:text-blue-300">Interviewer Feedback</p>
                            <p className="text-sm text-blue-700 dark:text-blue-400">{aiFeedback}</p>
                        </div>
                    </div>
                </div>
              )}

              <div className="space-y-4">
              <Textarea
                  placeholder="Type your answer or use the microphone..."
                  className="min-h-[200px] text-base"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isProcessing}
              />
              <div className="flex justify-between items-center">
                  <Button type="button" variant="outline" onClick={toggleRecording} disabled={isProcessing}>
                  {isRecording ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                  {isRecording ? "Stop" : "Record"}
                  </Button>
                  <Button onClick={handleSubmit} disabled={isProcessing || !currentAnswer}>
                  {isProcessing ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                      <Send className="mr-2 h-4 w-4" />
                  )}
                  {isProcessing ? "Evaluating..." : "Submit & Next Question"}
                  </Button>
              </div>
              </div>
          </CardContent>
        </Card>
      </main>
    </AppLayout>
  );
}
