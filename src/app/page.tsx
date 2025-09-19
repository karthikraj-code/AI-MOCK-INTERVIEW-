'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LayoutDashboard, 
  ClipboardList, 
  UserCheck, 
  FileText, 
  BrainCircuit, 
  Languages, 
  Users, 
  Building2, 
  Trophy, 
  Library,
  ArrowRight,
  Star,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Zap,
  Target,
  Play,
  Shield,
  Award,
  TrendingUp,
  Eye,
  Smile,
  Clock,
  MessageSquare,
  Lightbulb,
  HandHeart
} from 'lucide-react';

const features = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Track your progress with comprehensive analytics and performance insights.',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'aptitude-hr',
    title: 'Aptitude/HR Interview',
    description: 'Practice aptitude tests and HR interviews with AI-powered simulations.',
    icon: ClipboardList,
    href: '/interview/setup',
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'intro-analyzer',
    title: 'Intro Analyzer',
    description: 'Get detailed analysis of your interview performance with AI feedback.',
    icon: UserCheck,
    href: '/interview-analysis',
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'resume-analyzer',
    title: 'Resume Analyzer',
    description: 'Optimize your resume with AI-powered analysis and improvement suggestions.',
    icon: FileText,
    href: '/resume-analyzer',
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'tech-interview',
    title: 'Mock Tech Interview',
    description: 'Master technical interviews with coding challenges and system design questions.',
    icon: BrainCircuit,
    href: '/interview/technical/setup',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'language-coach',
    title: 'Language Coach',
    description: 'Improve your communication skills and build professional vocabulary.',
    icon: Languages,
    href: '/language-coach',
    color: 'from-indigo-500 to-indigo-600'
  },
  {
    id: 'peer-practice',
    title: 'Peer Practice',
    description: 'Collaborate with other students in group practice sessions.',
    icon: Users,
    href: '/peer-practice',
    color: 'from-pink-500 to-pink-600'
  },
  {
    id: 'company-simulator',
    title: 'Company Simulator',
    description: 'Prepare for specific companies like Google, Amazon, and more.',
    icon: Building2,
    href: '/company-simulator',
    color: 'from-teal-500 to-teal-600'
  },
  {
    id: 'leaderboard',
    title: 'Leaderboard',
    description: 'Compete with peers and track your ranking among students.',
    icon: Trophy,
    href: '/leaderboard',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    id: 'resources',
    title: 'Resources',
    description: 'Access learning materials, roadmaps, and study resources.',
    icon: Library,
    href: '/resources',
    color: 'from-gray-500 to-gray-600'
  }
];

// Custom hook for intersection observer
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);

  return [ref, isInView] as const;
};

// Interview Tips Carousel Component
const InterviewTipsCarousel = () => {
  const [currentTip, setCurrentTip] = useState(0);
  
  const tips = [
    {
      title: "Maintain Eye Contact",
      description: "Keep steady eye contact to show confidence and engagement throughout the interview.",
      icon: Eye,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Practice Your Smile",
      description: "A genuine smile creates a positive impression and shows your enthusiasm for the role.",
      icon: Smile,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Arrive 10 Minutes Early",
      description: "Punctuality demonstrates respect and professionalism to your potential employer.",
      icon: Clock,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Ask Thoughtful Questions",
      description: "Prepare insightful questions about the role and company to show genuine interest.",
      icon: MessageSquare,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "Research the Company",
      description: "Understanding the company culture and values helps you tailor your responses effectively.",
      icon: Lightbulb,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "Show Enthusiasm",
      description: "Express genuine interest and passion for the opportunity and the industry.",
      icon: HandHeart,
      color: "from-indigo-500 to-indigo-600"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [tips.length]);

  const IconComponent = tips[currentTip].icon;

  return (
    <div className="bg-white dark:bg-slate-800 p-3 xs:p-4 sm:p-6 lg:p-8 rounded-xl xs:rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-sm text-gray-500">Interview Tips</div>
      </div>
      
      <div className="space-y-4 xs:space-y-6">
        <div className="flex items-center space-x-3 xs:space-x-4">
          <div className={`bg-gradient-to-r ${tips[currentTip].color} p-2 xs:p-3 rounded-xl xs:rounded-2xl transition-all duration-500 transform hover:scale-110`}>
            <IconComponent className="h-5 w-5 xs:h-6 xs:w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-xs xs:text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
              Pro Tip #{currentTip + 1}
            </div>
            <div className="text-base xs:text-lg font-bold text-gray-900 dark:text-white transition-all duration-300">
              {tips[currentTip].title}
            </div>
          </div>
        </div>
        
        <p className="text-sm xs:text-base text-gray-600 dark:text-gray-300 leading-relaxed transition-all duration-300">
          {tips[currentTip].description}
        </p>
        
        {/* Progress indicators */}
        <div className="flex space-x-2 mt-6">
          {tips.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentTip 
                  ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        {/* Tip counter */}
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Interactive Tips</span>
          <span>{currentTip + 1} of {tips.length}</span>
        </div>
      </div>
    </div>
  );
};

// Features Carousel Component
const FeaturesCarousel = ({ handleSignIn }: { handleSignIn: () => void }) => {
  const [currentGroup, setCurrentGroup] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Group features into sets of 4
  const featureGroups = [];
  for (let i = 0; i < features.length; i += 4) {
    featureGroups.push(features.slice(i, i + 4));
  }
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentGroup((prev) => (prev + 1) % featureGroups.length);
        setIsTransitioning(false);
      }, 300);
    }, 4000); // Show each group for 4 seconds
    
    return () => clearInterval(interval);
  }, [featureGroups.length]);

  const currentFeatures = featureGroups[currentGroup] || [];

  return (
    <div className="relative overflow-hidden">
      {/* Progress indicators */}
      <div className="flex justify-center space-x-3 mb-12">
        {featureGroups.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsTransitioning(true);
              setTimeout(() => {
                setCurrentGroup(index);
                setIsTransitioning(false);
              }, 300);
            }}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === currentGroup 
                ? 'w-12 bg-gradient-to-r from-blue-500 to-purple-500' 
                : 'w-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Features display */}
      <div className={`transition-all duration-300 ${isTransitioning ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {currentFeatures.map((feature, index) => {
            const IconComponent = feature.icon;
            const isLeft = index % 2 === 0;
            const cardIndex = Math.floor(index / 2);
            
            // Gradient backgrounds for variety
            const gradientBgs = [
              'from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20',
              'from-purple-50 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20',
              'from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20',
              'from-orange-50 to-red-100 dark:from-orange-900/20 dark:to-red-900/20',
              'from-teal-50 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20',
              'from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20',
              'from-violet-50 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20',
              'from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20',
              'from-emerald-50 to-green-100 dark:from-emerald-900/20 dark:to-green-900/20',
              'from-sky-50 to-blue-100 dark:from-sky-900/20 dark:to-blue-900/20'
            ];

            // Rotation angles for variety
            const rotations = ['rotate-1', '-rotate-1', 'rotate-2', '-rotate-2'];
            const rotation = rotations[index % 4];
            const actualFeatureIndex = features.findIndex(f => f.id === feature.id);
            
            return (
              <div
                key={`${feature.id}-${currentGroup}`}
                className={`lg:col-span-1 ${
                  isLeft ? 'lg:order-1' : 'lg:order-2'
                } ${
                  cardIndex === 1 ? (isLeft ? 'lg:order-4' : 'lg:order-3') : ''
                } transition-all duration-500`}
                style={{ 
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <Card className={`group h-full hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-0 shadow-lg bg-gradient-to-br ${
                  gradientBgs[actualFeatureIndex % gradientBgs.length]
                } hover:scale-102 overflow-hidden relative transform ${rotation} group-hover:rotate-0 max-w-sm mx-auto`}>
                  
                  {/* Decorative elements - smaller */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-white/10 to-transparent rounded-full translate-y-8 -translate-x-8" />
                  
                  
                  
                  <CardHeader className="pb-4 relative z-10">
                    <div className={`bg-gradient-to-r ${feature.color} p-3 rounded-2xl mb-4 w-fit group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                      <IconComponent className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-2">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10 p-4">
                    <CardDescription className="text-gray-700 dark:text-gray-300 mb-6 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                    <Button 
                      onClick={handleSignIn}
                      className={`bg-gradient-to-r ${feature.color} hover:shadow-lg hover:scale-105 transition-all duration-300 text-white border-0 font-semibold px-5 py-2 rounded-xl text-sm`}
                    >
                      Explore
                      <ArrowRight className="ml-2 h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

     
    </div>
  );
};

// Floating orbs background
const FloatingOrbs = () => {
  const [orbs, setOrbs] = useState<Array<{
    left: number;
    top: number;
    size: number;
    delay: number;
    duration: number;
    color: string;
  }>>([]);

  useEffect(() => {
    const orbData = [...Array(8)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 60 + Math.random() * 120,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
      color: ['bg-blue-500/10', 'bg-purple-500/10', 'bg-pink-500/10', 'bg-indigo-500/10'][Math.floor(Math.random() * 4)]
    }));
    setOrbs(orbData);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`absolute rounded-full ${orb.color} animate-pulse blur-xl`}
          style={{
            left: `${orb.left}%`,
            top: `${orb.top}%`,
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            animationDelay: `${orb.delay}s`,
            animationDuration: `${orb.duration}s`
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const [heroRef, heroInView] = useInView(0.3);
  const [featuresRef, featuresInView] = useInView(0.1);
  const [ctaRef, ctaInView] = useInView(0.3);

  const handleSignIn = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-8">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/hero-video.mp4" type="video/mp4" />
            {/* Fallback for browsers that don't support video */}
            Your browser does not support the video tag.
          </video>
          {/* Overlay to ensure text readability */}
          <div className="absolute inset-0 bg-black/80 dark:bg-black/85"></div>
        </div>
        
        <FloatingOrbs />
        
        <div ref={heroRef} className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className={`transition-all duration-1000 ${
                heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
                <div className="flex items-center space-x-2 xs:space-x-3 sm:space-x-4 lg:space-x-7 mb-4 sm:mb-6">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-1.5 xs:p-2 rounded-lg xs:rounded-xl flex-shrink-0">
                    <GraduationCap className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <span className="text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl 2xl:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight whitespace-nowrap">
                    Placement Training Platform
                  </span>
                </div>
                
                <div className="inline-flex items-center px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-400 text-xs xs:text-sm font-medium mb-4 sm:mb-6">
                  <Sparkles className="w-3 h-3 xs:w-4 xs:h-4 mr-1.5 xs:mr-2" />
                  AI-Powered Interview Training
                </div>
                
                <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Master Your
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Dream Interview
                  </span>
                </h1>
              </div>
              
              <div className={`transition-all duration-1000 delay-300 ${
                heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
                <p className="text-base xs:text-lg sm:text-xl text-white leading-relaxed max-w-lg">
                  Transform your career with our comprehensive AI-powered platform. Practice, analyze, and perfect your interview skills with personalized feedback.
                </p>
              </div>
              
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-1000 delay-500 ${
                heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
                <Button 
                  onClick={handleSignIn}
                  size="lg"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 xs:px-6 sm:px-8 py-3 xs:py-4 text-sm xs:text-base sm:text-lg font-semibold shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <Play className="mr-1.5 xs:mr-2 h-4 w-4 xs:h-5 xs:w-5" />
                  <span className="hidden xs:inline">Start Your First Mock Interview</span>
                  <span className="xs:hidden">Start Mock Interview</span>
                  <ArrowRight className="ml-1.5 xs:ml-2 h-4 w-4 xs:h-5 xs:w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
              
              {/* Trust indicators */}
              <div className={`flex items-center space-x-8 pt-8 transition-all duration-1000 delay-700 ${
                heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}>
              </div>
            </div>
            
            {/* Right Content - Visual */}
            <div className={`relative transition-all duration-1000 delay-200 ${
              heroInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
            }`}>
              <div className="relative">
                {/* Interview Tips Carousel */}
                <InterviewTipsCarousel />
                
                {/* Floating elements */}
                <div className="absolute -top-3 -right-3 sm:-top-6 sm:-right-6 bg-gradient-to-r from-blue-500 to-purple-500 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg animate-bounce">
                  <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                
                <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-gradient-to-r from-pink-500 to-orange-500 p-2 sm:p-4 rounded-xl sm:rounded-2xl shadow-lg animate-pulse">
                  <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white dark:bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-20 transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Powerful Features
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Excel in Interviews
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive platform provides cutting-edge tools and resources designed to help you succeed in any interview scenario.
            </p>
          </div>

          {/* Modern Features Carousel */}
          <div ref={featuresRef} className={`transition-all duration-1000 ${
            featuresInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <FeaturesCarousel handleSignIn={handleSignIn} />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />

        <div ref={ctaRef} className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className={`transition-all duration-1000 ${
            ctaInView ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
          }`}>
            
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Ace Your
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Next Interview?
              </span>
            </h2>
          </div>
          
          <div className={`transition-all duration-1000 delay-300 ${
            ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
          </div>
          
          <div className={`transition-all duration-1000 delay-500 ${
            ctaInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            <Button 
              onClick={handleSignIn}
              size="lg"
              className="group bg-white text-slate-900 hover:bg-gray-100 px-12 py-6 text-xl font-semibold shadow-2xl hover:shadow-3xl transition-all duration-500 hover:scale-105 rounded-2xl"
            >
              <Play className="mr-3 h-6 w-6 group-hover:scale-110 transition-transform" />
              Start Your Journey
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Button>
            
            
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Placement Training Platform</span>
            </div>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Empowering the next generation of professionals with AI-powered interview preparation.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}