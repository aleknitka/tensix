'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, CheckCircle, SkipForward, Edit3, MessageCircle } from 'lucide-react';
import Markdown from './Markdown';

interface Message {
  id: string;
  role: string;
  content: string;
  timestamp: string;
}

interface RefinementViewProps {
  sessionId: string;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onConfirm: (refinedPrompt: string) => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export default function RefinementView({ 
  sessionId, 
  messages, 
  onSendMessage, 
  onConfirm, 
  onSkip, 
  isLoading 
}: RefinementViewProps) {
  const [input, setInput] = useState('');
  const [refinedPrompt, setRefinedPrompt] = useState('');
  const [isEditingRefined, setIsEditingRefined] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [streamingText, setStreamingText] = useState('');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingText]);

  // Handle refinement streaming
  const startRefinementTurn = () => {
    if (eventSourceRef.current) return;
    
    setStreamingText('');
    const eventSource = new EventSource(`http://localhost:3001/sessions/${sessionId}/refine`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'text') {
        setStreamingText(prev => prev + data.text);
      } else if (data.type === 'error') {
        console.error('Refinement error:', data.message);
        eventSource.close();
        eventSourceRef.current = null;
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  };

  // Trigger refinement when the last message is from the user
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'user' && !isLoading) {
      startRefinementTurn();
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || eventSourceRef.current) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white dark:bg-zinc-950 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
      {/* Header Indicator */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-800/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg text-indigo-600 dark:text-indigo-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Problem Refinement Phase</h3>
            <p className="text-xs text-indigo-700/70 dark:text-indigo-300/50 font-medium">Clarifying your goals before the round-table evaluation.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSkip}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Skip Refinement
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Dialogue Area */}
        <div className="flex-1 flex flex-col border-r border-zinc-100 dark:border-zinc-800/50">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((m) => (
              <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role !== 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md' 
                  : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                }`}>
                  <Markdown content={m.content} variant={m.role === 'user' ? 'user' : 'assistant'} />
                </div>
              </div>
            ))}
            
            {streamingText && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center flex-shrink-0 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300">
                  <Bot className="w-5 h-5 animate-pulse" />
                </div>
                <div className="max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                  <Markdown content={streamingText} />
                  <span className="inline-block w-1 h-4 ml-1 bg-indigo-500 animate-pulse align-middle" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800/50">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || !!eventSourceRef.current}
                placeholder="Answer the Refiner's question..."
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim() || !!eventSourceRef.current}
                className="bg-indigo-600 text-white px-4 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95 shadow-md flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </form>
          </div>
        </div>

        {/* Refined Prompt Area */}
        <div className="w-80 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Refined Prompt</h4>
              <button 
                onClick={() => setIsEditingRefined(!isEditingRefined)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            {isEditingRefined ? (
              <textarea
                value={refinedPrompt}
                onChange={(e) => setRefinedPrompt(e.target.value)}
                placeholder="The Refiner will summarize your final prompt here, or you can write it manually..."
                className="w-full h-64 p-4 text-xs font-medium leading-relaxed bg-white dark:bg-zinc-950 border-2 border-indigo-500 dark:border-indigo-400 rounded-xl outline-none resize-none shadow-lg"
              />
            ) : (
              <div className="w-full min-h-[16rem] p-4 text-xs font-medium leading-relaxed bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-y-auto text-zinc-600 dark:text-zinc-400 shadow-inner">
                {refinedPrompt || <span className="text-zinc-400 italic">The Refiner will help you draft the perfect prompt here.</span>}
              </div>
            )}
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={() => onConfirm(refinedPrompt)}
              disabled={!refinedPrompt.trim() || isLoading}
              className="w-full py-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] transition-all disabled:opacity-50 shadow-xl"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm & Start Audit
            </button>
            <p className="text-[10px] text-center text-zinc-400 font-medium px-4">
              Confirming will finalize the problem statement and start the expert evaluation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
