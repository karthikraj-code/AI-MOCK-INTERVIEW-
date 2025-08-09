'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2 } from 'lucide-react';
import { useState } from 'react';

type WelcomeScreenProps = {
  onStart: () => void;
};

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleStartClick = () => {
    setIsLoading(true);
    // onStart is synchronous now, it just changes the step
    onStart(); 
  };

  return (
    <Card className="w-full max-w-2xl mx-auto text-center shadow-2xl animate-fade-in">
      <CardHeader>
        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold">Ace the Interview</CardTitle>
        <CardDescription className="text-lg">
          Welcome to your AI-powered mock interview. Get ready to practice and receive instant feedback.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-8 pb-8">
        <p className="mb-6 text-muted-foreground">
          We'll ask you a few common interview questions. Your session will be recorded and analyzed to provide detailed feedback on your communication and body language.
        </p>
        <Button onClick={handleStartClick} size="lg" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting ready...
            </>
          ) : (
            'Start Interview'
          )}
        </Button>
        <p className="mt-4 text-xs text-muted-foreground">
          Please allow access to your camera and microphone when prompted.
        </p>
      </CardContent>
    </Card>
  );
}
