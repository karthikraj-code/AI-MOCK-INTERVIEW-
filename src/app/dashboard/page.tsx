"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, BarChart, FileText, Lightbulb, Sparkles, TrendingUp, Award, Clock, Target, PlayCircle, ChevronRight, Star } from "lucide-react";

type PastInterview = {
  id: string;
  jobRole: string;
  date: string;
  overallScore: number;
};

const WelcomeBot = () => (
    <div className="relative">
        <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-bounce-subtle">
            <circle cx="24" cy="24" r="24" fill="hsl(var(--primary) / 0.2)" className="animate-pulse"/>
            <path d="M24 16C27.3137 16 30 18.6863 30 22V24C30 27.3137 27.3137 30 24 30C20.6863 30 18 27.3137 18 24V22C18 18.6863 20.6863 16 24 16Z" fill="hsl(var(--primary))"/>
            <circle cx="21" cy="23" r="1.5" fill="hsl(var(--primary-foreground))"/>
            <circle cx="27" cy="23" r="1.5" fill="hsl(var(--primary-foreground))"/>
            <path d="M22 27H26" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"/>
            <path d="M19 18L18 17" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M29 18L30 17" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div className="absolute -top-1 -right-1 animate-ping">
            <Sparkles className="h-4 w-4 text-primary/60" />
        </div>
    </div>
)

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  gradient: string;
}

const StatCard = ({ icon, title, value, description, gradient }: StatCardProps) => (
    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-500 group cursor-pointer">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`}></div>
        <CardContent className="p-4 sm:p-6 relative z-10">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <div className="text-white">
                        {icon}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
                        {value}
                    </div>
                </div>
            </div>
            <h3 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600">{description}</p>
        </CardContent>
    </Card>
);

export default function DashboardPage() {
  const [pastInterviews, setPastInterviews] = useState<PastInterview[]>([]);
  const [userName, setUserName] = useState("User");
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const averageScore = pastInterviews.length > 0 
    ? (pastInterviews.reduce((sum, interview) => sum + interview.overallScore, 0) / pastInterviews.length).toFixed(1)
    : "0.0";

  const stats = [
    {
      icon: <Target className="h-5 w-5" />,
      title: "Interviews Completed",
      value: pastInterviews.length,
      description: "Total practice sessions",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Average Score",
      value: averageScore,
      description: "Overall performance",
      gradient: "from-emerald-500 to-green-500"
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Best Score",
      value: pastInterviews.length > 0 ? Math.max(...pastInterviews.map(i => i.overallScore)) : 0,
      description: "Personal record",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: "This Week",
      value: pastInterviews.filter(i => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return new Date(i.date) > weekAgo;
      }).length,
      description: "Recent sessions",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <AppLayout>
        <main className="flex-1 overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -inset-10 opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-300/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                </div>
            </div>

            <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 space-y-6 sm:space-y-8">
                {/* Enhanced Welcome Section */}
                <div 
                    className="relative overflow-hidden rounded-2xl p-8 shadow-xl"
                    style={{ 
                        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 100%)',
                        transform: `translateY(${scrollY * 0.1}px)`
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 animate-shimmer"></div>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-4 sm:gap-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            <WelcomeBot />
                            <div className="space-y-2">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                                    Welcome back Champ, {userName}! 👋
                                </h1>
                                <p className="text-base sm:text-lg text-primary/80">
                                    Ready for your next interview session? Let's make it count!
                                </p>
                            </div>
                        </div>
                        <Link href="/interview/setup" passHref>
                            <Button className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground rounded-full p-3 sm:p-4 h-auto shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-110 w-full sm:w-auto">
                                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 group-hover:rotate-180 transition-transform duration-700"/>
                                <span className="ml-2 sm:hidden">Start Interview</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute top-4 right-20 animate-float">
                        <Star className="h-6 w-6 text-primary/30" />
                    </div>
                    <div className="absolute bottom-4 left-20 animate-float animation-delay-2000">
                        <Sparkles className="h-4 w-4 text-primary/40" />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                            <StatCard {...stat} />
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 sm:gap-8 lg:grid-cols-3">
                    {/* Recent Performance - Enhanced */}
                    <Card className="lg:col-span-2 relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50"></div>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-3 sm:gap-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg">
                                    <BarChart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <CardTitle className="text-lg sm:text-xl font-bold text-primary">Recent Performance</CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <TrendingUp className="w-4 h-4" />
                                {pastInterviews.length} sessions
                            </div>
                        </CardHeader>
                        <CardContent className="min-h-[180px] sm:min-h-[200px] relative z-10 p-4 sm:p-6">
                            {pastInterviews.length > 0 ? (
                                <div className="space-y-3">
                                {pastInterviews.slice(0, 3).map((interview, index) => (
                                    <Link href={`/interview/${interview.id}/results`} key={interview.id} passHref>
                                        <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl hover:bg-white/70 cursor-pointer border border-transparent hover:border-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg backdrop-blur-sm gap-3 sm:gap-0">
                                            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                                                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm sm:text-base">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 sm:flex-none">
                                                    <p className="font-semibold text-card-foreground group-hover:text-primary transition-colors duration-300 text-sm sm:text-base">
                                                        {interview.jobRole}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                                        {new Date(interview.date).toLocaleDateString('en-US', { 
                                                            month: 'short', 
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className={`text-lg font-bold ${
                                                    interview.overallScore >= 8 ? 'text-green-500' : 
                                                    interview.overallScore >= 6 ? 'text-yellow-500' : 'text-red-500'
                                                } group-hover:scale-110 transition-transform duration-300`}>
                                                    {interview.overallScore}/10
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-12 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                        <BarChart className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-lg mb-1">No interviews yet</p>
                                        <p className="text-sm">Start your first mock interview to see your progress here</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Video Analysis - Enhanced */}
                    <Card className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 group">
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 group-hover:from-yellow-100/50 group-hover:to-orange-100/50 transition-all duration-500"></div>
                        <CardHeader className="flex flex-row items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                                <CardTitle className="text-lg sm:text-xl font-bold text-primary">Video Analysis</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center min-h-[180px] sm:min-h-[200px] gap-4 sm:gap-6 relative z-10 p-4 sm:p-6">
                            <div className="space-y-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500">
                                    <PlayCircle className="h-8 w-8 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 mb-2">AI-Powered Feedback</p>
                                    <p className="text-sm text-muted-foreground">
                                        Get instant feedback on your body language, tone, and communication skills.
                                    </p>
                                </div>
                            </div>
                             <Link href="/interview-analysis" passHref>
                                <Button variant="outline" className="group/btn border-2 hover:bg-gradient-to-r hover:from-yellow-500 hover:to-orange-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-md hover:shadow-lg">
                                    <span className="group-hover/btn:scale-105 transition-transform duration-300">Start Analysis</span>
                                    <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* CTA Section - Enhanced */}
                <div className="flex justify-center pt-8">
                     <Link href="/interview/setup" passHref>
                        <Button size="lg" className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 hover:from-primary/90 hover:via-primary/80 hover:to-primary/70 text-primary-foreground font-bold text-lg px-12 py-6 rounded-2xl shadow-2xl hover:shadow-primary/25 transition-all duration-500 hover:scale-105">
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10 flex items-center gap-3">
                                <PlayCircle className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                                Start New Mock Interview
                                <Sparkles className="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
        </main>

        <style jsx>{`
            @keyframes bounce-subtle {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-4px); }
            }
            
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
            }
            
            @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(100%); }
            }
            
            @keyframes fade-in {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }
            
            .animate-bounce-subtle {
                animation: bounce-subtle 3s ease-in-out infinite;
            }
            
            .animate-float {
                animation: float 4s ease-in-out infinite;
            }
            
            .animate-shimmer {
                animation: shimmer 3s ease-in-out infinite;
            }
            
            .animate-fade-in {
                animation: fade-in 0.6s ease-out forwards;
            }
            
            .animation-delay-2000 {
                animation-delay: 2s;
            }
            
            .animation-delay-4000 {
                animation-delay: 4s;
            }
        `}</style>
    </AppLayout>
  );
}