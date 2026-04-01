'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DebateView from '@/components/DebateView';
import RoundTableConfig from '@/components/RoundTableConfig';
import DocumentManager from '@/components/DocumentManager';
import BranchNavigator from '@/components/BranchNavigator';
import { MessageSquare, LayoutDashboard, ChevronLeft, Download, FileText, Loader2, Bot } from 'lucide-react';
import Link from 'next/link';

interface OrchestrationStep {
  personaId: string;
  content: string;
  type?: 'text' | 'suggestion' | 'system';
  suggestedPersonaId?: string;
}

function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const [messages, setMessages] = useState<any[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<OrchestrationStep | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchMessages = async () => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3001/sessions/${id}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  const handleSendMessage = async (content: string) => {
    if (!id) return;
    try {
      await fetch(`http://localhost:3001/sessions/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user' })
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await fetch(`http://localhost:3001/messages/${messageId}`, { method: 'DELETE' });
      fetchMessages();
    } catch (err) {
      console.error('Failed to delete message', err);
    }
  };

  const handleUpdateMessage = async (messageId: string, content: string) => {
    try {
      await fetch(`http://localhost:3001/messages/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to update message', err);
    }
  };

  const handleForkMessage = async (messageId: string) => {
    if (!id) return;
    try {
      const res = await fetch(`http://localhost:3001/sessions/${id}/fork`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId })
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/sessions?id=${data.id}`);
      }
    } catch (err) {
      console.error('Failed to fork session', err);
    }
  };

  const handleStartEvaluation = (personaIds: string[], mode: string = 'sequential', maxTurns: number = 10) => {
    if (!id) return;
    setIsEvaluating(true);
    setStreamingMessage(null);

    const eventSource = new EventSource(`http://localhost:3001/sessions/${id}/evaluate?personaIds=${personaIds.join(',')}&mode=${mode}&maxTurns=${maxTurns}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const step = JSON.parse(event.data);
      
      if (step.type === 'suggestion') {
        // HITL mode: suggest persona and pause
        setStreamingMessage({
          personaId: step.personaId,
          content: step.content,
          type: 'suggestion',
          suggestedPersonaId: step.suggestedPersonaId
        });
        setIsEvaluating(false);
        eventSource.close();
        eventSourceRef.current = null;
        return;
      }

      if (step.personaId === 'SYSTEM' && step.isDone) {
        eventSource.close();
        eventSourceRef.current = null;
        setIsEvaluating(false);
        setStreamingMessage(null);
        fetchMessages();
        return;
      }

      if (step.isDone) {
        setStreamingMessage(null);
        fetchMessages(); // Refresh to get the saved message
      } else {
        setStreamingMessage((prev: OrchestrationStep | null) => ({
          personaId: step.personaId,
          content: (prev?.content || '') + (step.content || '')
        }));
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      eventSourceRef.current = null;
      setIsEvaluating(false);
      setStreamingMessage(null);
    };
  };

  const handleStopEvaluation = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsEvaluating(false);
      setStreamingMessage(null);
      fetchMessages();
    }
  };

  const handleApproveSuggestion = () => {
    if (streamingMessage?.suggestedPersonaId) {
      handleStartEvaluation([streamingMessage.suggestedPersonaId], 'sequential', 1);
    }
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await fetch(`http://localhost:3001/sessions/${id}/report`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.report) {
        // Refresh messages since the report is saved to DB
        fetchMessages();

        // Also trigger download for user convenience
        const blob = new Blob([data.report], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-report-${id}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleExportJson = () => {
    if (!id) return;
    window.open(`http://localhost:3001/sessions/${id}/export/json`, '_blank');
  };

  const handleExportMarkdown = () => {
    if (!id) return;
    window.open(`http://localhost:3001/sessions/${id}/export/markdown`, '_blank');
  };

  if (!id) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-zinc-500">No session selected.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 bg-zinc-900 dark:bg-zinc-100 rounded-lg">
            <MessageSquare className="w-5 h-5 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-tight">Session Audit</h1>
            <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg"
          >
            <Download className="w-3.5 h-3.5" />
            Export JSON
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 rounded-lg"
          >
            <FileText className="w-3.5 h-3.5" />
            Export Markdown
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={isGeneratingReport || messages.length === 0}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-sm"
          >
            {isGeneratingReport ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileText className="w-3.5 h-3.5" />
            )}
            Generate Audit Report
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden p-6 gap-6">
        <div className="flex-[3] flex flex-col h-full overflow-hidden">
          {streamingMessage?.type === 'suggestion' && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-200">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-blue-900 dark:text-blue-100">Next Turn Suggested</div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Blue Hat suggests running <span className="font-bold">{streamingMessage.suggestedPersonaId}</span>.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStreamingMessage(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveSuggestion}
                  className="bg-blue-600 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95"
                >
                  Approve & Run
                </button>
              </div>
            </div>
          )}
          <DebateView 
            messages={messages} 
            streamingMessage={streamingMessage?.type === 'suggestion' ? null : streamingMessage}
            onSendMessage={handleSendMessage}
            onDeleteMessage={handleDeleteMessage}
            onUpdateMessage={handleUpdateMessage}
            onForkMessage={handleForkMessage}
            isLoading={isEvaluating}
          />
        </div>
        
        <div className="flex-2 w-[400px] flex flex-col gap-6 overflow-y-auto pr-2">
          <BranchNavigator currentSessionId={id} />
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-extrabold uppercase text-zinc-400 mb-3 flex items-center gap-2 tracking-wider">
              <LayoutDashboard className="w-3.5 h-3.5" />
              Session Insights
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
              Select the participants from the Six Thinking Hats below. Each expert will evaluate the latest idea sequentially to maintain your GPU VRAM limits.
            </p>
          </div>
          <DocumentManager sessionId={id} />
          <RoundTableConfig 
            sessionId={id} 
            onStartEvaluation={handleStartEvaluation}
            onStopEvaluation={handleStopEvaluation}
            isEvaluating={isEvaluating}
          />
        </div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SessionContent />
    </Suspense>
  );
}
