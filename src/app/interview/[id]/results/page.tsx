
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


  if (isLoading || !results) {
    return (
      <AppLayout>
        <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h2 className="text-xl font-semibold">Generating Your Results...</h2>
          <p className="text-muted-foreground">This may take a moment. Please don't refresh the page.</p>
        </main>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <main className="flex-1 p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Interview Results</h1>
                <p className="text-muted-foreground">Analysis for your {results.jobRole} mock interview.</p>
            </div>
            <Link href="/interview/setup" passHref>
                <Button>Start Another Interview</Button>
            </Link>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart/> Overall Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                <RechartsBarChart accessibilityLayer data={results.scores} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" dataKey="value" domain={[0, 10]} tickCount={6} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={120} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                  <Bar dataKey="value" radius={5} />
                </RechartsBarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><MessageSquareQuote/> AI Feedback</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{results.feedback}</p>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp/> Learning Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed whitespace-pre-wrap">{results.learningPlan}</p>
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BrainCircuit/> Question & Answer Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {results.qna.map((item, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="text-left font-semibold hover:no-underline">{item.question}</AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-2">
                      <div>
                        <h4 className="font-medium mb-2 text-muted-foreground">Your Answer:</h4>
                        <blockquote className="p-4 bg-muted border-l-4 border-muted-foreground/20 rounded-r-md">
                            {item.answer}
                        </blockquote>
                      </div>
                       <div>
                        <h4 className="font-medium mb-2 text-muted-foreground">Feedback:</h4>
                        <blockquote className="p-4 bg-accent/10 text-accent-foreground border-l-4 border-accent rounded-r-md">
                            {item.feedback}
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
    </AppLayout>
  );
}
