
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2, Send, User, X } from "lucide-react";
import { FormEvent, useRef, useEffect } from "react";
import type { ChatMessage } from "./chatbot";

type ChatbotWindowProps = {
  messages: ChatMessage[];
  onClose: () => void;
  onSubmit: (message: string) => void;
  isLoading: boolean;
};

export function ChatbotWindow({ messages, onClose, onSubmit, isLoading }: ChatbotWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const message = formData.get("message") as string;
    if (message.trim()) {
      onSubmit(message);
      e.currentTarget.reset();
    }
  };

  return (
    <Card className="fixed bottom-6 right-6 w-full max-w-sm h-[70vh] flex flex-col shadow-2xl z-50 animate-in slide-in-from-bottom-10 duration-500">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
                <Bot className="h-5 w-5 text-primary"/>
            </div>
            <div>
                <CardTitle>AI Interview Assistant</CardTitle>
                <CardDescription>Your 24/7 placement guide</CardDescription>
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
              {msg.sender === 'ai' && <Bot className="h-6 w-6 text-primary flex-shrink-0" />}
              <div className={`rounded-lg p-3 max-w-[80%] ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p className="text-sm">{msg.text}</p>
              </div>
              {msg.sender === 'user' && <User className="h-6 w-6 text-muted-foreground flex-shrink-0" />}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <Bot className="h-6 w-6 text-primary flex-shrink-0" />
              <div className="rounded-lg p-3 bg-muted flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Thinking...</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input name="message" placeholder="Ask anything..." disabled={isLoading} />
          <Button type="submit" disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
