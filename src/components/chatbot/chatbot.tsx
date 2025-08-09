
"use client";

import { useState, useTransition } from "react";
import { ChatbotIcon } from "./chatbot-icon";
import { ChatbotWindow } from "./chatbot-window";
import { chatbotFlow } from "@/ai/flows/chatbot-flow";

export type ChatMessage = {
  sender: 'user' | 'ai';
  text: string;
};

type ChatbotProps = {
    section: string;
}

export function Chatbot({section}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
      { sender: 'ai', text: `Hi there! I'm your AI Interview Assistant. How can I help you with the ${section} section today?` }
  ]);
  const [isLoading, startTransition] = useTransition();

  const handleToggle = () => setIsOpen(prev => !prev);
  
  const handleSubmit = (message: string) => {
    setMessages(prev => [...prev, { sender: 'user', text: message }]);
    
    startTransition(async () => {
        try {
            const result = await chatbotFlow({ user_question: message, section });
            setMessages(prev => [...prev, { sender: 'ai', text: result.response }]);
        } catch (error) {
            console.error("Chatbot error:", error);
            setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I'm having trouble connecting. Please try again later." }]);
        }
    });
  };

  return (
    <>
      {isOpen ? (
        <ChatbotWindow 
          messages={messages} 
          onClose={handleToggle} 
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      ) : (
        <ChatbotIcon onClick={handleToggle} />
      )}
    </>
  );
}
