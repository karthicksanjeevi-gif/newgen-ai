import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Header from './components/Header';
import ChatInput from './components/ChatInput';
import MessageBubble from './components/MessageBubble';
import TypingIndicator from './components/TypingIndicator';
import { geminiService } from './services/geminiService';
import { liveService } from './services/liveService';
import { Message, Sender } from './types';

const App: React.FC = () => {
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Init Gemini Text Chat
  useEffect(() => {
    try {
        geminiService.initChat();
    } catch (e) {
        console.error("Failed to init chat", e);
        setError("Failed to initialize chat service. Check API key.");
    }
  }, []);

  // Handle Live Voice Toggle
  const toggleLive = async () => {
    if (isLiveActive) {
      await liveService.disconnect();
      // State will be updated via callback in connect() but we can force it here for immediate UI feedback
      setIsLiveActive(false);
    } else {
      try {
        await liveService.connect((active) => {
            setIsLiveActive(active);
        });
      } catch (e: any) {
        console.error("Failed to start live session", e);
        setError("Could not access microphone or connect to Friday Live.");
      }
    }
  };

  const handleSendMessage = async (text: string, image?: string) => {
    setError(null);
    setIsLoading(true);

    const userMsg: Message = {
      id: uuidv4(),
      role: Sender.User,
      content: text,
      image: image,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Create a placeholder bot message
      const botMsgId = uuidv4();
      const initialBotMsg: Message = {
        id: botMsgId,
        role: Sender.Bot,
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, initialBotMsg]);

      let fullResponse = "";
      
      // Extract mimetype from base64 if image exists
      let imagePayload;
      if (image) {
          const match = image.match(/^data:(.*);base64,/);
          const mimeType = match ? match[1] : 'image/jpeg';
          imagePayload = { data: image, mimeType };
      }

      const stream = geminiService.sendMessageStream(text, imagePayload);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === botMsgId 
              ? { ...msg, content: fullResponse } 
              : msg
          )
        );
      }

      // Finalize message
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === botMsgId 
            ? { ...msg, isStreaming: false } 
            : msg
        )
      );

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
      
      const errorMsg: Message = {
        id: uuidv4(),
        role: Sender.Bot,
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: Date.now(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Header 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        isLiveActive={isLiveActive}
        toggleLive={toggleLive}
      />

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-4 pt-24 pb-4">
        {messages.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-50">
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                <Sparkles size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-2">Welcome to Friday</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              I am online and ready. Start a conversation, upload an image, or activate Voice Mode.
            </p>
          </div>
        ) : (
          <>
             {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
             ))}
             {isLoading && messages[messages.length - 1]?.role === Sender.User && (
                 <div className="flex justify-start mb-6">
                    <TypingIndicator />
                 </div>
             )}
          </>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="flex-shrink-0 bg-gray-50 dark:bg-gray-900">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} disabled={!!error && messages.length === 0} />
      </footer>
    </div>
  );
};

function Sparkles({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" />
      <path d="M9 5h4" />
      <path d="M5 21v-4" />
      <path d="M9 19h4" />
    </svg>
  );
}

export default App;