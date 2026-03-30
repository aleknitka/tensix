'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Bot, Send, Loader2, Trash2, Edit2, Save, X } from 'lucide-react';

interface Message {
  id: string;
  role: string;
  content: string;
  personaId?: string | null;
  personaName?: string;
  timestamp: string;
}

interface DebateViewProps {
  messages: Message[];
  streamingMessage?: { personaId: string; content: string } | null;
  onSendMessage: (content: string) => void;
  onDeleteMessage: (id: string) => void;
  onUpdateMessage: (id: string, content: string) => void;
  isLoading?: boolean;
}

export default function DebateView({ messages, streamingMessage, onSendMessage, onDeleteMessage, onUpdateMessage, isLoading }: DebateViewProps) {
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input);
    setInput('');
  };

  const handleStartEdit = (m: Message) => {
    setEditingId(m.id);
    setEditContent(m.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateMessage(editingId, editContent);
      setEditingId(null);
      setEditContent('');
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto bg-white dark:bg-zinc-950 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {messages.length === 0 && !streamingMessage && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">The Round Table is Ready</h3>
              <p className="text-zinc-500 max-w-sm text-sm">
                Share your idea, proposal, or problem to start the multi-perspective evaluation.
              </p>
            </div>
          </div>
        )}

        {[...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((m) => {
          const isAuditReport = m.content.includes('Final Audit Report') || m.personaName === 'Blue Hat';
          
          return (
            <div key={m.id} className={`flex gap-4 group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                  isAuditReport 
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-500' 
                    : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500'
                }`}>
                  <Bot className="w-6 h-6" />
                </div>
              )}
              <div className={`max-w-[85%] space-y-1 flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                  {m.role === 'user' ? (
                    <>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Proponent</span>
                    </>
                  ) : (
                    <>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isAuditReport ? 'text-blue-500' : 'text-zinc-400'}`}>
                        {m.personaName || (isAuditReport ? 'Blue Hat' : 'Expert')}
                      </span>
                      {isAuditReport && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-blue-200 dark:border-blue-800">
                          Final Audit
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-500 font-medium">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </>
                  )}
                </div>
                
                <div className="relative group/content max-w-full">
                  {editingId === m.id ? (
                    <div className="space-y-2 min-w-[300px]">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-4 rounded-2xl text-sm leading-relaxed bg-white dark:bg-zinc-800 border-2 border-zinc-900 dark:border-zinc-100 outline-none resize-none"
                        rows={Math.max(3, editContent.split('\n').length)}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={handleCancelEdit} className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"><X className="w-4 h-4" /></button>
                        <button onClick={handleSaveEdit} className="p-1 text-emerald-500 hover:text-emerald-600"><Save className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`p-5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg'
                          : isAuditReport
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-2 border-blue-100 dark:border-blue-900/30 text-zinc-800 dark:text-zinc-200 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm'
                      }`}>
                        {m.content}
                      </div>
                      {!isLoading && (
                        <div className={`absolute top-0 flex gap-1 p-1 opacity-0 group-hover/content:opacity-100 transition-opacity ${
                          m.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                        }`}>
                          <button 
                            onClick={() => handleStartEdit(m)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => onDeleteMessage(m.id)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-400 hover:text-rose-500 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-6 h-6 text-white dark:text-zinc-900" />
                </div>
              )}
            </div>
          );
        })}

        {streamingMessage && (
          <div className="flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <Bot className="w-6 h-6 text-zinc-500 animate-pulse" />
            </div>
            <div className="max-w-[85%] space-y-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">
                  Speaking...
                </span>
              </div>
              <div className="p-4 rounded-2xl text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm">
                {streamingMessage.content}
                <span className="inline-block w-1 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-zinc-50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit} className="flex gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Describe your idea for evaluation..."
            className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-5 py-4 text-sm focus:ring-4 focus:ring-zinc-900/5 dark:focus:ring-zinc-100/5 outline-none transition-all disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-xl font-bold text-sm flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
