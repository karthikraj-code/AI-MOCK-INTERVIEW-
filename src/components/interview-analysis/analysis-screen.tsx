import { Loader2, BrainCircuit } from 'lucide-react';

export default function AnalysisScreen() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center p-8 h-full animate-fade-in">
        <div className="relative">
            <BrainCircuit className="h-16 w-16 text-primary" />
            <Loader2 className="absolute -top-2 -right-2 h-8 w-8 animate-spin text-primary/70" />
        </div>
        <h2 className="text-2xl font-bold mt-4">Analyzing Your Interview...</h2>
        <p className="text-muted-foreground max-w-md">
            Our AI is processing your video to provide detailed feedback. This might take a moment. Please don't close this window.
        </p>
    </div>
  );
}
