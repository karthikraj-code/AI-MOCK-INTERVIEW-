"use client";

import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Sparkles, Users, Target, Clock, ArrowRight, Star, Zap, Award, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function CompanySimulatorPage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const companies = [
    { 
      name: 'Google', 
      gradient: 'from-blue-500 to-green-500',
      bgGradient: 'from-blue-50 to-green-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg',
      description: 'Search & Cloud Innovation'
    },
    { 
      name: 'Amazon', 
      gradient: 'from-orange-500 to-yellow-500',
      bgGradient: 'from-orange-50 to-yellow-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg',
      description: 'E-commerce & AWS'
    },
    { 
      name: 'Microsoft', 
      gradient: 'from-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 to-indigo-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoftsqlserver/microsoftsqlserver-plain.svg',
      description: 'Cloud & Productivity'
    },
    { 
      name: 'Apple', 
      gradient: 'from-gray-700 to-gray-900',
      bgGradient: 'from-gray-50 to-slate-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg',
      description: 'Consumer Technology'
    },
    { 
      name: 'Meta', 
      gradient: 'from-blue-600 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg',
      description: 'Social & Metaverse'
    },
    { 
      name: 'Netflix', 
      gradient: 'from-red-600 to-red-700',
      bgGradient: 'from-red-50 to-pink-50',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTUuMzk4IDBoNC4yMTJsNS40IDE0LjRWMGg0LjIxMnYyNGgtNC4yMTJsLTUuNC0xNC40VjI0SDUuMzk4VjB6IiBmaWxsPSIjRTUwOTE0Ii8+Cjwvc3ZnPg==',
      description: 'Streaming & Entertainment'
    },
    { 
      name: 'Tesla', 
      gradient: 'from-red-500 to-gray-800',
      bgGradient: 'from-red-50 to-gray-50',
      logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJ6IiBmaWxsPSIjRTA2QjZCIi8+Cjwvc3ZnPg==',
      description: 'Electric Vehicles & Energy'
    },
    { 
      name: 'Spotify', 
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-emerald-50',
      logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spotify/spotify-original.svg',
      description: 'Music Streaming'
    }
  ];

  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: 'Company-Specific Questions',
      description: 'Practice with questions tailored to each company\'s interview style and culture.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Real Interview Process',
      description: 'Experience the complete interview pipeline from screening to final rounds.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: 'Timed Simulations',
      description: 'Practice under realistic time constraints to build confidence.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const stats = [
    { icon: <Star className="h-5 w-5" />, value: '50+', label: 'Top Companies' },
    { icon: <Zap className="h-5 w-5" />, value: '1000+', label: 'Interview Questions' },
    { icon: <Award className="h-5 w-5" />, value: '95%', label: 'Success Rate' },
    { icon: <TrendingUp className="h-5 w-5" />, value: '24/7', label: 'Available' }
  ];

  return (
    <AppLayout>
      <main className="flex-1 overflow-hidden">
        {/* Background Animation */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
          </div>
        </div>

        <div className="relative z-10 p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-16">
            {/* Hero Section with Parallax */}
            <div className="text-center space-y-8 mb-16" style={{ transform: `translateY(${scrollY * 0.1}px)` }}>
              <div className="relative">
                <div className="mx-auto bg-gradient-to-br from-primary/30 to-primary/10 p-8 rounded-3xl mb-8 w-fit relative overflow-hidden group hover:scale-105 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent animate-pulse"></div>
                  <Building2 className="h-16 w-16 text-primary relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                  <div className="absolute -top-2 -right-2 animate-bounce animation-delay-1000">
                    <Sparkles className="h-6 w-6 text-primary/80" />
                  </div>
                  <div className="absolute -bottom-1 -left-1 animate-bounce animation-delay-2000">
                    <Star className="h-4 w-4 text-primary/60" />
                  </div>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent mb-6 animate-fade-in">
                  Company Simulator
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Master company-specific interviews with our comprehensive simulation platform
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:bg-white/80 transition-all duration-300 group">
                    <div className="text-primary mb-2 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>


            {/* Scrolling Companies Marquee */}
            <div className="space-y-6 mt-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Featured Companies</h2>
                <p className="text-muted-foreground text-lg">Practice with industry leaders and their unique interview processes</p>
              </div>
              
              <div className="relative overflow-hidden py-8">
                <div className="flex animate-scroll-left space-x-6">
                  {[...companies, ...companies].map((company, index) => (
                    <Card key={index} className="min-w-[280px] group hover:shadow-xl transition-all duration-500 hover:scale-105 cursor-pointer border-2 hover:border-primary/30">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${company.bgGradient} rounded-xl flex items-center justify-center p-3 group-hover:rotate-6 transition-transform duration-300`}>
                            <img 
                              src={company.logo} 
                              alt={company.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const nextSibling = target.nextSibling as HTMLElement;
                                if (nextSibling) nextSibling.style.display = 'block';
                              }}
                            />
                            <div className={`hidden text-xl font-bold bg-gradient-to-r ${company.gradient} bg-clip-text text-transparent`}>
                              {company.name[0]}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-bold text-lg bg-gradient-to-r ${company.gradient} bg-clip-text text-transparent mb-1`}>
                              {company.name}
                            </h3>
                            <p className="text-sm text-gray-600">{company.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Features with Hover Effects */}
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">What Makes Us Special</h2>
                <p className="text-muted-foreground text-lg">Comprehensive interview preparation that gives you the edge</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="group hover:shadow-2xl transition-all duration-500 border-2 hover:border-transparent hover:-translate-y-2 cursor-pointer overflow-hidden relative">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                    <CardContent className="p-8 relative z-10">
                      <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="font-bold text-xl mb-3 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Coming Soon with Enhanced Animation */}
            <Card className="relative overflow-hidden border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-background hover:shadow-2xl transition-all duration-700 group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 animate-shimmer"></div>
              <CardHeader className="text-center relative z-10">
                <div className="inline-flex items-center gap-2 bg-primary/15 text-primary px-6 py-3 rounded-full text-sm font-semibold mb-6 hover:bg-primary/25 transition-colors duration-300 cursor-pointer">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Coming Very Soon
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-4">
                  The Future of Interview Prep
                </CardTitle>
                <CardDescription className="text-lg max-w-2xl mx-auto">
                  We're crafting the most comprehensive interview simulation platform ever created. 
                  Get ready for an experience that will transform how you prepare for your dream job.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-8 border border-white/40 hover:bg-white/80 transition-colors duration-300">
                  <p className="text-gray-700 leading-relaxed text-lg text-center">
                    🚀 <strong>Advanced AI simulations</strong> • 🎯 <strong>Real-time feedback</strong> • 
                    📊 <strong>Performance analytics</strong> • 🏆 <strong>Achievement system</strong> • 
                    👥 <strong>Peer comparison</strong> • 🎥 <strong>Video practice sessions</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </AppLayout>
  );
}