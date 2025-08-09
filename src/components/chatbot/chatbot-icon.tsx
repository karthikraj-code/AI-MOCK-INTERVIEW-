
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

type ChatbotIconProps = {
  onClick: () => void;
};

export function ChatbotIcon({ onClick }: ChatbotIconProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 flex items-center justify-center"
      aria-label="Open AI Assistant"
    >
      <Bot className="h-8 w-8" />
    </Button>
  );
}
