"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
  attachments?: { type: 'image' | 'audio', url: string, name: string }[];
}

export function CitizenAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      content: "Hello. I am SentinelAI's reporting assistant. Are you in immediate danger? If so, please press the SOS button. Otherwise, how can I help you today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState<{ type: 'image' | 'audio', url: string, name: string }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          content: "I have recorded your report and filed it under tracking ID #RPT-8422. A human dispatcher will review this shortly. Please retain any additional evidence you may have.",
        }
      ]);
    }, 2000);
  };

  const handleAttachImage = () => {
    setAttachments(prev => [...prev, { type: 'image', url: '/images/mock-evidence.jpg', name: 'screenshot_evidence.jpg' }]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-6rem)] bg-background border border-outline/10 sm:rounded-3xl sm:m-6 overflow-hidden">
      
      {/* Header */}
      <div className="bg-surface-dim p-4 border-b border-outline/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center relative">
          <span className="w-2 h-2 rounded-full bg-success absolute bottom-0 right-0 border border-surface-dim"></span>
          <span className="font-bold text-primary">AI</span>
        </div>
        <div>
          <h2 className="font-headline-sm font-semibold">Report Assistant</h2>
          <p className="text-xs text-on-surface-variant">Automated Intake System</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 ${
              msg.role === 'user' 
                ? 'bg-primary text-on-primary rounded-br-sm' 
                : 'bg-surface-container text-on-surface rounded-bl-sm border border-outline/10'
            }`}>
              <p className="text-sm">{msg.content}</p>
              
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {msg.attachments.map((att, i) => (
                    <div key={i} className="flex items-center gap-2 bg-black/20 p-2 rounded-lg text-xs">
                      {att.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      <span className="truncate">{att.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-surface-container rounded-2xl p-4 rounded-bl-sm border border-outline/10 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 rounded-full bg-on-surface-variant animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-t border-outline/10 bg-surface flex gap-2 overflow-x-auto">
          {attachments.map((att, i) => (
            <div key={i} className="bg-surface-container-high rounded p-2 flex items-center gap-2 text-xs relative pr-8 shrink-0">
              {att.type === 'image' ? <ImageIcon className="h-4 w-4 text-primary" /> : <Mic className="h-4 w-4 text-primary" />}
              <span className="truncate max-w-[100px]">{att.name}</span>
              <button 
                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 p-1 hover:bg-black/20 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 bg-surface-dim border-t border-outline/10 flex items-end gap-2 pb-safe">
        <div className="flex flex-col gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 text-on-surface-variant rounded-full" onClick={handleAttachImage}>
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 text-on-surface-variant rounded-full hidden sm:flex">
            <Mic className="h-5 w-5" />
          </Button>
        </div>
        
        <Input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe the incident..."
          className="bg-background border-outline/20 flex-1 py-6 rounded-2xl resize-none"
        />
        
        <Button 
          size="icon" 
          className="h-12 w-12 rounded-full shrink-0 bg-primary text-on-primary hover:bg-primary/90"
          onClick={handleSend}
          disabled={!input.trim() && attachments.length === 0}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
