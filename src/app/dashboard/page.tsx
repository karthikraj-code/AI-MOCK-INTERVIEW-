
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart, FileText, Lightbulb, Sparkles } from "lucide-react";

type PastInterview = {
  id: string;
  jobRole: string;
  date: string;
  overallScore: number;
};

const WelcomeBot = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="hsl(var(--primary) / 0.1)"/>
        <path d="M24 16C27.3137 16 30 18.6863 30 22V24C30 27.3137 27.3137 30 24 30C20.6863 30 18 27.3137 18 24V22C18 18.6863 20.6863 16 24 16Z" fill="hsl(var(--primary))"/>
        <circle cx="21" cy="23" r="1" fill="hsl(var(--primary-foreground))"/>
        <circle cx="27" cy="23" r="1" fill="hsl(var(--primary-foreground))"/>
        <path d="M22 27H26" stroke="hsl(var(--primary-foreground))" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M19 18L18 17" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
        <path d="M29 18L30 17" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"/>
    </svg>
)

export default function DashboardPage() {
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([]);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    // Try to fetch user name from API
    fetch("/api/profile")
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.name) {
            setUserName(data.user.name);
            return;
          }
        }
        // fallback to JWT if API fails
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            setUserName(decoded.name || decoded.email || "User");
          } catch (e) {
            setUserName("User");
          }
        } else {
          setUserName("User");
        }
      })
      .catch(() => {
        // fallback to JWT if API fails
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded: any = jwtDecode(token);
            setUserName(decoded.name || decoded.email || "User");
          } catch (e) {
            setUserName("User");
          }
        } else {
          setUserName("User");
        }
      });
    const storedInterviews = localStorage.getItem("past_interviews");
    if (storedInterviews) {
      const parsedInterviews: PastInterview[] = JSON.parse(storedInterviews);
      const uniqueInterviews = parsedInterviews.filter(
        (interview, index, self) =>
          index === self.findIndex((t) => t.id === interview.id)
      );
      setPastInterviews(uniqueInterviews);
    }
  }, []);

  return (
    <AppLayout>
        <main className="flex-1 p-4 md:p-8 bg-gray-50/50 dark:bg-background">
            <div className="bg-primary/10 dark:bg-card rounded-lg p-6 flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <WelcomeBot />
                    <div>
                        <h1 className="text-2xl font-bold text-primary dark:text-primary-foreground">Welcome back Champ, {userName}!</h1>
                        <p className="text-primary/80 dark:text-muted-foreground">Ready for your next interview session?</p>
                    </div>
                </div>
                <Link href="/interview/setup" passHref>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 h-auto shadow-lg">
                        <Sparkles className="h-6 w-6"/>
                    </Button>
                </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-primary dark:text-primary-foreground">Recent Performance</CardTitle>
                        <BarChart className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="min-h-[150px]">
                        {pastInterviews.length > 0 ? (
                            <div className="space-y-4">
                            {pastInterviews.slice(0, 3).map((interview) => (
                                <Link href={`/interview/${interview.id}/results`} key={interview.id} passHref>
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 dark:hover:bg-secondary cursor-pointer">
                                        <div>
                                            <p className="font-semibold text-card-foreground dark:text-primary-foreground">{interview.jobRole}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Interviewed on {new Date(interview.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="text-lg font-bold text-primary dark:text-primary">{interview.overallScore}/10</div>
                                    </div>
                                </Link>
                            ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center text-center text-muted-foreground h-full pt-10">
                                <p>No completed interviews yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-primary dark:text-primary-foreground">Video Analysis</CardTitle>
                        <Lightbulb className="w-5 h-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center text-center text-muted-foreground min-h-[150px] gap-4">
                        <p>Get instant feedback on your body language and communication.</p>
                         <Link href="/interview-analysis" passHref>
                            <Button variant="outline">Start Analysis</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-8 flex justify-center">
                 <Link href="/interview/setup" passHref>
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base">
                        Start New Mock Interview
                    </Button>
                </Link>
            </div>
        </main>
    </AppLayout>
  );
}
