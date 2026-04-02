'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Bot, Send, Loader2, Trash2, Edit2, Save, X, Terminal, GitFork } from 'lucide-react';
import Markdown from './Markdown';
import { getIconById } from './IconPicker';
import { getBorderColorClass, getTextColorClass } from './ColorPicker';

interface Message {
  id: string;
  role: string;
  content: string;
  personaId?: string | null;
  personaName?: string | null;
  personaIcon?: string | null;
  personaColor?: string | null;
  metadata?: string | null;
  timestamp: string;
}

interface DebateViewProps {
  messages: Message[];
  streamingMessage?: { personaId: string; content: string } | null;
  onSendMessage: (content: string) => void;
  onDeleteMessage: (id: string) => void;
  onUpdateMessage: (id: string, content: string) => void;
  onForkMessage?: (messageId: string) => void;
  isLoading?: boolean;
}

export default function DebateView({ messages, streamingMessage, onSendMessage, onDeleteMessage, onUpdateMessage, onForkMessage, isLoading }: DebateViewProps) {
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
    <div className="flex flex-col h-full max-w-7xl mx-auto bg-white dark:bg-zinc-950 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth">
        {messages.length === 0 && !streamingMessage && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20">
            <div className="w-16 h-16 rounded-3xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600">
              <Bot className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">The Round Table is Ready</h3>
              <p className="text-zinc-600 max-w-sm text-sm">
                Share your idea, proposal, or problem to start the multi-perspective evaluation.
              </p>
            </div>
          </div>
        )}

        {[...messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map((m) => {
          const isAuditReport = m.content.includes('Final Audit Report') || m.personaName === 'Blue Hat';
          const toolData = m.metadata ? JSON.parse(m.metadata) : null;
          
          if (toolData?.toolCall) {
            return (
              <div key={m.id} className="flex justify-start ml-14 animate-in fade-in slide-in-from-left-4 duration-500">
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-4 flex flex-col gap-3 shadow-sm min-w-[300px] max-w-[600px]">
                  <div className="flex items-center justify-between border-b border-amber-100 dark:border-amber-900/20 pb-2">
                    <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Terminal className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Tool Execution</span>
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tight border border-amber-200 dark:border-amber-700/50">
                      {toolData.toolCall.function.name}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-bold text-amber-800/60 dark:text-amber-200/40 uppercase tracking-widest pl-1">Arguments</div>
                      <pre className="text-[11px] font-mono text-amber-900 dark:text-amber-100 bg-white dark:bg-black/40 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all shadow-inner border border-amber-100 dark:border-amber-900/30">
                        {toolData.toolCall.function.arguments}
                      </pre>
                    </div>
                    {toolData.result && (
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-bold text-emerald-800/60 dark:text-emerald-200/40 uppercase tracking-widest pl-1">Result</div>
                        <div className="text-[11px] font-mono text-emerald-900 dark:text-emerald-100 bg-emerald-50/50 dark:bg-emerald-900/20 p-3 rounded-xl overflow-x-auto whitespace-pre-wrap break-all border border-emerald-100 dark:border-emerald-800/30 shadow-inner">
                          {toolData.result}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          const IconComp = m.personaIcon ? getIconById(m.personaIcon) : (m.role === 'user' ? User : Bot);
          const accentColor = m.personaColor || (isAuditReport ? 'blue' : 'slate');
          
          return (
            <div key={m.id} className={`flex gap-4 group ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role !== 'user' && (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${getTextColorClass(accentColor)} bg-white dark:bg-zinc-900 ${getBorderColorClass(accentColor)}`}>
                  <IconComp className="w-6 h-6" />
                </div>
              )}
              <div className={`max-w-[85%] space-y-1 flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 px-1">
                  {m.role === 'user' ? (
                    <>
                      <span className="text-[10px] text-zinc-600 font-medium">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">Proponent</span>
                    </>
                  ) : (
                    <>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${getTextColorClass(accentColor)}`}>
                        {m.personaName || (isAuditReport ? 'Blue Hat' : 'Expert')}
                      </span>
                      {isAuditReport && (
                        <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-blue-200 dark:border-blue-800">
                          Final Audit
                        </span>
                      )}
                      <span className="text-[10px] text-zinc-600 font-medium">
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
                        <button onClick={handleCancelEdit} className="p-1 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100"><X className="w-4 h-4" /></button>
                        <button onClick={handleSaveEdit} className="p-1 text-emerald-500 hover:text-emerald-600"><Save className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`rounded-2xl text-sm leading-relaxed border-l-4 ${
                        m.role === 'user'
                          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg p-4'
                          : isAuditReport
                          ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-zinc-800 dark:text-zinc-200 shadow-sm p-5 border-blue-500'
                          : `bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm p-5 ${getBorderColorClass(accentColor)}`
                      }`}>
                        <Markdown content={m.content} variant={m.role === 'user' ? 'user' : 'assistant'} />
                      </div>
                      {!isLoading && (
                        <div className={`absolute top-0 flex gap-1 p-1 opacity-0 group-hover/content:opacity-100 transition-opacity ${
                          m.role === 'user' ? 'right-full mr-2' : 'left-full ml-2'
                        }`}>
                          <button 
                            onClick={() => handleStartEdit(m)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {onForkMessage && (
                            <button 
                              onClick={() => onForkMessage(m.id)}
                              title="Fork session from here"
                              className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-blue-500 shadow-sm"
                            >
                              <GitFork className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => onDeleteMessage(m.id)}
                            className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 hover:text-rose-500 shadow-sm"
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
              <Bot className="w-6 h-6 text-zinc-600 animate-pulse" />
            </div>
            <div className="max-w-[85%] space-y-1">
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 animate-pulse">
                  Speaking...
                </span>
              </div>
              <div className="p-4 rounded-2xl text-sm leading-relaxed bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm">
                <Markdown content={streamingMessage.content} />
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
