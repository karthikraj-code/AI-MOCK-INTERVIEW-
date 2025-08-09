
"use client";

import { useState, useTransition, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mic, MicOff, Send, Brain, Sparkles, BookOpen, ThumbsUp, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio } from '@/ai/flows/interview-analysis/transcribe-audio';
import { gradeSpeech, GradeSpeechOutput } from '@/ai/flows/grade-speech';
import { getDailyVocabulary, VocabularyWord } from '@/ai/flows/vocabulary-builder';

const ScoreCircle = ({ score, label }: { score: number; label: string }) => (
    <div className="flex flex-col items-center gap-2">
        <div className="relative h-24 w-24">
            <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                    className="stroke-current text-gray-200 dark:text-gray-700"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                ></circle>
                <circle
                    className="stroke-current text-primary"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - score / 10)}`}
                    transform="rotate(-90 50 50)"
                ></circle>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{score}</span>
            </div>
        </div>
        <p className="font-semibold text-muted-foreground">{label}</p>
    </div>
);

function SpeechGrader() {
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isProcessing, startProcessing] = useTransition();
    const [results, setResults] = useState<GradeSpeechOutput | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const handleStartRecording = async () => {
        setTranscript("");
        setResults(null);
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                recordedChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };

                mediaRecorderRef.current.onstart = () => {
                    setIsRecording(true);
                };
                
                mediaRecorderRef.current.onstop = () => {
                    setIsRecording(false);
                    processRecording();
                };

                mediaRecorderRef.current.start();
                
                // Stop recording after 60 seconds
                setTimeout(() => {
                    if(mediaRecorderRef.current?.state === 'recording') {
                        mediaRecorderRef.current.stop();
                        toast({ title: "Time's up!", description: "Recording automatically stopped after 60 seconds." });
                    }
                }, 60000);

            } catch (err) {
                toast({ variant: 'destructive', title: 'Permission Denied', description: 'Please enable microphone access.' });
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
    };
    
    const processRecording = () => {
        startProcessing(async () => {
            if (recordedChunksRef.current.length === 0) {
                toast({ variant: 'destructive', title: 'Empty Recording', description: 'No audio was recorded.' });
                return;
            }

            const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                try {
                    const { transcription } = await transcribeAudio({ audioDataUri: base64Audio });
                    setTranscript(transcription);
                    
                    const gradeResults = await gradeSpeech({ transcript: transcription });
                    setResults(gradeResults);

                } catch (error) {
                    console.error(error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Failed to process your speech. Please try again.' });
                }
            };
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Practice Your Pitch</CardTitle>
                <CardDescription>Record a response (up to 60s) and get instant feedback on your language and clarity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center gap-4 p-8 bg-muted rounded-lg">
                    {isRecording ? (
                         <Button onClick={handleStopRecording} variant="destructive" size="lg" className="h-16 w-16 rounded-full">
                            <MicOff className="h-8 w-8" />
                        </Button>
                    ) : (
                         <Button onClick={handleStartRecording} size="lg" disabled={isProcessing} className="h-16 w-16 rounded-full">
                            <Mic className="h-8 w-8" />
                        </Button>
                    )}
                    <p className="text-sm text-muted-foreground">{isRecording ? 'Recording... click to stop.' : isProcessing ? 'Processing...' : 'Click to start recording'}</p>
                </div>
                
                {(isProcessing || transcript) && (
                     <Card className="bg-background">
                         <CardContent className="pt-6">
                             {isProcessing && !results && (
                                <div className="flex items-center justify-center flex-col gap-2 p-4 text-muted-foreground">
                                    <Loader2 className="animate-spin h-8 w-8" />
                                    <p>Analyzing your speech...</p>
                                </div>
                             )}
                            {transcript && !isProcessing && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Your Transcript:</h3>
                                    <p className="text-muted-foreground p-4 bg-muted rounded-md">{transcript}</p>
                                </div>
                            )}
                         </CardContent>
                     </Card>
                )}

                {results && (
                     <Card className="bg-background">
                        <CardHeader>
                            <CardTitle>Your Results</CardTitle>
                        </CardHeader>
                         <CardContent className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                 <ScoreCircle score={results.grammarScore} label="Grammar" />
                                 <ScoreCircle score={results.clarityScore} label="Clarity" />
                                 <ScoreCircle score={results.vocabularyScore} label="Vocabulary" />
                             </div>
                             <div>
                                 <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><ThumbsUp /> Suggestions for Improvement</h3>
                                 <ul className="space-y-2 list-inside">
                                     {results.suggestions.map((suggestion, index) => (
                                         <li key={index} className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                                             <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                                             <span className="text-green-800 dark:text-green-300">{suggestion}</span>
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                         </CardContent>
                     </Card>
                )}

            </CardContent>
        </Card>
    );
}


function VocabularyBuilder() {
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [isLoading, startTransition] = useTransition();

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        const storedData = localStorage.getItem('daily_vocab');
        
        if (storedData) {
            const { date, words } = JSON.parse(storedData);
            if (date === today) {
                setWords(words);
                return;
            }
        }
        
        startTransition(async () => {
            const result = await getDailyVocabulary();
            setWords(result.words);
            localStorage.setItem('daily_vocab', JSON.stringify({ date: today, words: result.words }));
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Vocabulary Builder</CardTitle>
                <CardDescription>Expand your professional lexicon with three new words each day.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {words.map((word, index) => (
                            <div key={index} className="p-4 bg-muted rounded-lg">
                                <h3 className="text-xl font-bold text-primary">{word.word}</h3>
                                <p className="text-sm italic text-muted-foreground mt-1">{word.meaning}</p>
                                <p className="mt-3 text-sm border-l-2 border-primary pl-3">"{word.example}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function LanguageCoachPage() {
    return (
        <AppLayout>
            <main className="flex-1 p-4 md:p-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2"><Brain /> Language Coach</h1>
                        <p className="text-muted-foreground">Hone your communication skills for interview success.</p>
                    </div>
                </div>

                <Tabs defaultValue="grader" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="grader"><Sparkles className="mr-2 h-4 w-4" /> Speech Grader</TabsTrigger>
                        <TabsTrigger value="vocab"><BookOpen className="mr-2 h-4 w-4" /> Vocabulary Builder</TabsTrigger>
                    </TabsList>
                    <TabsContent value="grader" className="mt-6">
                        <SpeechGrader />
                    </TabsContent>
                    <TabsContent value="vocab" className="mt-6">
                        <VocabularyBuilder />
                    </TabsContent>
                </Tabs>
            </main>
        </AppLayout>
    );
}
