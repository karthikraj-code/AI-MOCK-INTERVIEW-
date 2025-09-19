import { Loader2, BrainCircuit } from 'lucide-react';

export default function AnalysisScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center p-8 h-full animate-fade-in">
      {/* Enhanced icon container with proper spacing and animations */}
      <div className="relative flex items-center justify-center">
        <div className="relative">
          {/* Main brain icon with subtle pulse animation */}
          <div className="relative z-10">
            <BrainCircuit className="h-20 w-20 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          

          
          {/* Decorative ring animation */}
          <div className="absolute inset-0 rounded-full border-2 border-blue-400/30 dark:border-blue-300/30 animate-ping scale-125"></div>
        </div>
      </div>

      {/* Enhanced text content */}
      <div className="space-y-3">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          Analyzing Your Interview...
        </h2>
        <p className="text-muted-foreground dark:text-gray-300 max-w-md leading-relaxed">
          Our AI is processing your video to provide detailed feedback. This might take a moment. Please don't close this window.
        </p>
      </div>

      {/* Progress indicator dots */}
      <div className="flex space-x-2 mt-4">
        <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}