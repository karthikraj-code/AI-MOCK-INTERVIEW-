"use client";

import { useEffect, useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart, BrainCircuit, Loader2, MessageSquareQuote, TrendingUp } from "lucide-react";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { generateImprovementFeedback } from "@/ai/flows/generate-improvement-feedback";
import { generatePersonalizedLearningPlan } from "@/ai/flows/personalized-learning-plan";
import type { EvaluateAnswerOutput } from "@/ai/flows/answer-evaluator";

type InterviewData = {
  jobRole: string;
  resume: string;
  questions: string[];
  answers: string[];
  evaluations: EvaluateAnswerOutput[];
};

type ResultsData = {
  jobRole: string;
  scores: { name: string; value: number; fill: string; }[];
  feedback: string;
  learningPlan: string;
  qna: { question: string; answer: string; feedback: string; }[];
};

const chartConfig = {
  value: { label: "Score" },
  Communication: { label: "Communication", color: "hsl(var(--chart-1))" },
  Technical: { label: "Technical", color: "hsl(var(--chart-2))" },
  Confidence: { label: "Confidence", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

export default function InterviewResultsPage() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.id as string;
  
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processResults = async () => {
      // **Critical Fix**: Check for fully processed results first to prevent any duplication.
      const pastInterviewsStr = localStorage.getItem("past_interviews");
      const currentPastInterviews = pastInterviewsStr ? JSON.parse(pastInterviewsStr) : [];
      
      const existingInterview = currentPastInterviews.find((i: any) => i.id === interviewId);
      if (existingInterview?.results) {
        setResults(existingInterview.results);
        setIsLoading(false);
        // Clean up temp data if it still exists for any reason
        if (localStorage.getItem(`interview_${interviewId}`)) {
          localStorage.removeItem(`interview_${interviewId}`);
        }
        return; // Exit early, results are already processed and stored.
      }
      
      // If no stored results, proceed with processing the temporary interview data.
      const dataStr = localStorage.getItem(`interview_${interviewId}`);
      if (!dataStr) {
        // If there's no temp data and no stored results, the interview is invalid.
        router.push('/dashboard');
        return;
      }
      
      const data: InterviewData = JSON.parse(dataStr);

      if (!data.evaluations || data.evaluations.length === 0) {
        // Invalid data, redirect to dashboard.
        localStorage.removeItem(`interview_${interviewId}`);
        router.push('/dashboard');
        return;
      }

      // Generate new results with AI (this will now only run once).
      const avgScores = data.evaluations.reduce((acc, curr) => {
        acc.communication += curr.communication;
        acc.technical += curr.technical;
        acc.confidence += curr.confidence;
        return acc;
      }, { communication: 0, technical: 0, confidence: 0 });

      const numEvals = data.evaluations.length;
      avgScores.communication = parseFloat((avgScores.communication / numEvals).toFixed(1));
      avgScores.technical = parseFloat((avgScores.technical / numEvals).toFixed(1));
      avgScores.confidence = parseFloat((avgScores.confidence / numEvals).toFixed(1));

      const combinedFeedback = data.evaluations.map(e => e.feedback).join('\n\n');

      const [improvementSuggestions, learningPlan] = await Promise.all([
        generateImprovementFeedback({
          feedback: combinedFeedback,
          scores: avgScores,
          jobRole: data.jobRole
        }),
        generatePersonalizedLearningPlan({
            resume: data.resume,
            jobRole: data.jobRole,
            feedback: combinedFeedback,
        })
      ]);

      const qna = data.questions.map((q, i) => ({
        question: q,
        answer: data.answers[i] || "No answer provided.",
        feedback: data.evaluations[i]?.feedback || "No feedback available.",
      }));

      const processedResults: ResultsData = {
        jobRole: data.jobRole,
        scores: [
          { name: "Communication", value: avgScores.communication, fill: "var(--color-Communication)" },
          { name: "Technical", value: avgScores.technical, fill: "var(--color-Technical)" },
          { name: "Confidence", value: avgScores.confidence, fill: "var(--color-Confidence)" },
        ],
        feedback: improvementSuggestions.improvementSuggestions,
        learningPlan: learningPlan.learningPlan,
        qna,
      };

      setResults(processedResults);

      // Save the newly generated results to the persistent list.
      const overallScore = (avgScores.communication + avgScores.technical + avgScores.confidence) / 3;
      const newInterviewSummary = {
        id: interviewId,
        jobRole: data.jobRole,
        date: new Date().toISOString(),
        overallScore: parseFloat(overallScore.toFixed(1)),
        results: processedResults,
      };
      
      // Ensure no duplicates are added even with this new logic.
      const updatedPastInterviews = currentPastInterviews.filter((i: any) => i.id !== interviewId);
      updatedPastInterviews.unshift(newInterviewSummary);
      localStorage.setItem('past_interviews', JSON.stringify(updatedPastInterviews));
      
      // Clean up the temporary data now that it's been processed and saved.
      localStorage.removeItem(`interview_${interviewId}`);
      setIsLoading(false);
    };

    processResults();
  }, [interviewId, router]);

  // Enhanced loading animation with 3D effects
  if (isLoading || !results) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-4 min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-pink-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10 drop-shadow-lg" style={{ 
              animation: 'spin 2s linear infinite, float 3s ease-in-out infinite',
              filter: 'drop-shadow(0 0 20px hsl(var(--primary)))'
            }} />
          </div>
          <div className="text-center space-y-2 animate-pulse">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
              Generating Your Results...
            </h2>
            <p className="text-muted-foreground animate-bounce">This may take a moment. Please don't refresh the page.</p>
          </div>
          <div className="flex space-x-1 mt-4">
            {[0, 1, 2].map((i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </main>
        <style jsx>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(180deg); }
          }
        `}</style>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-background via-background to-muted/10">
        {/* Enhanced Header with Parallax Effect */}
        <div 
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-12 gap-6 relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-blue-500/5 via-pink-500/5 to-blue-500/5 backdrop-blur-sm border border-border/50"
          style={{
            background: 'linear-gradient(135deg, rgb(59 130 246)/0.05 0%, rgb(236 72 153)/0.05 50%, rgb(59 130 246)/0.05 100%)',
            boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.1), 0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -skew-x-12 animate-pulse opacity-30"></div>
          <div className="relative z-10 transform transition-transform duration-500 hover:scale-105">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
              Interview Results
            </h1>
            <p className="text-muted-foreground text-lg mt-2 font-medium">
              Analysis for your <span className="text-blue-500 font-semibold">{results.jobRole}</span> mock interview.
            </p>
          </div>
          <Link href="/interview/setup" passHref>
            <Button 
              size="lg"
              className="relative overflow-hidden group bg-gradient-to-r from-blue-500 to-pink-500 hover:from-pink-500 hover:to-blue-500 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative z-10">Start Another Interview</span>
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Enhanced Scores Card */}
          <Card className="lg:col-span-5 group relative overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/5 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] border-border/50">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-pink-500/10 group-hover:scale-110 transition-transform duration-300">
                  <BarChart className="text-blue-500 group-hover:text-pink-500 transition-colors duration-300"/>
                </div>
                Overall Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="transform transition-transform duration-500 group-hover:scale-[1.01]">
                <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
                  <RechartsBarChart accessibilityLayer data={results.scores} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid horizontal={false} />
                    <XAxis type="number" dataKey="value" domain={[0, 10]} tickCount={6} />
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                    <Bar dataKey="value" radius={8} />
                  </RechartsBarChart>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced AI Feedback Card */}
          <Card className="lg:col-span-3 group relative overflow-hidden bg-gradient-to-br from-card via-card to-pink-500/5 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-blue-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/10 to-blue-500/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <MessageSquareQuote className="text-pink-500 group-hover:text-blue-500 transition-colors duration-300"/>
                </div>
                AI Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-muted/30 to-pink-500/10 border border-border/30 backdrop-blur-sm group-hover:bg-gradient-to-br group-hover:from-pink-500/10 group-hover:to-blue-500/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <p className="text-base leading-relaxed whitespace-pre-wrap relative z-10 group-hover:text-foreground/90 transition-colors duration-300">
                  {results.feedback}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Enhanced Learning Plan Card */}
          <Card className="lg:col-span-2 group relative overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/5 hover:shadow-xl transition-all duration-500 transform hover:scale-[1.02] hover:-translate-y-1 border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-pink-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-pink-500/10 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
                  <TrendingUp className="text-blue-500 group-hover:text-pink-500 transition-colors duration-300"/>
                </div>
                Learning Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="relative p-6 rounded-xl bg-gradient-to-br from-muted/30 to-blue-500/10 border border-border/30 backdrop-blur-sm group-hover:bg-gradient-to-br group-hover:from-blue-500/10 group-hover:to-pink-500/10 transition-all duration-500">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                <p className="text-base leading-relaxed whitespace-pre-wrap relative z-10 group-hover:text-foreground/90 transition-colors duration-300">
                  {results.learningPlan}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Q&A Card */}
          <Card className="lg:col-span-5 group relative overflow-hidden bg-gradient-to-br from-card via-card to-blue-500/5 hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.01] border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-pink-500 to-blue-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-pink-500/10 group-hover:scale-110 transition-transform duration-300">
                  <BrainCircuit className="text-blue-500 group-hover:text-pink-500 transition-colors duration-300"/>
                </div>
                Question & Answer Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {results.qna.map((item, index) => (
                  <AccordionItem 
                    value={`item-${index}`} 
                    key={index}
                    className="border border-border/50 rounded-xl bg-gradient-to-r from-muted/20 to-transparent hover:from-muted/40 hover:to-blue-500/10 transition-all duration-300 overflow-hidden group/item"
                  >
                    <AccordionTrigger 
                      className="text-left font-semibold hover:no-underline px-6 py-4 hover:bg-gradient-to-r hover:from-blue-500/5 hover:to-pink-500/5 transition-all duration-300 group-hover/item:translate-x-2"
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-primary-foreground text-sm font-bold group-hover/item:scale-110 transition-transform duration-300">
                          {index + 1}
                        </div>
                        <span className="group-hover/item:text-blue-500 transition-colors duration-300">
                          {item.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-6 pt-2 px-6 pb-6">
                      <div className="transform transition-all duration-500 hover:scale-[1.01]">
                        <h4 className="font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          Your Answer:
                        </h4>
                        <blockquote className="p-6 bg-gradient-to-br from-muted/50 to-muted/30 border-l-4 border-muted-foreground/20 rounded-r-xl backdrop-blur-sm hover:from-muted/70 hover:to-muted/50 transition-all duration-300 hover:shadow-md relative overflow-hidden group/answer">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/20 to-transparent opacity-0 group-hover/answer:opacity-100 transition-opacity duration-500"></div>
                          <span className="relative z-10">{item.answer}</span>
                        </blockquote>
                      </div>
                      <div className="transform transition-all duration-500 hover:scale-[1.01]">
                        <h4 className="font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                          Feedback:
                        </h4>
                        <blockquote className="p-6 bg-gradient-to-br from-pink-500/10 to-blue-500/10 text-accent-foreground border-l-4 border-pink-500 rounded-r-xl backdrop-blur-sm hover:from-pink-500/20 hover:to-blue-500/20 transition-all duration-300 hover:shadow-md relative overflow-hidden group/feedback">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-500/20 to-transparent opacity-0 group-hover/feedback:opacity-100 transition-opacity duration-500"></div>
                          <span className="relative z-10">{item.feedback}</span>
                        </blockquote>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Enhanced Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      `}</style>
    </AppLayout>
  );
}