'use client';

import { useEffect, useState, Suspense } from 'react';
import { PlusCircle, MessageSquare, Clock, Settings } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface Session {
  id: string;
  title: string;
  updatedAt: string;
}

function SidebarContent() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentId = searchParams.get('id');

  const fetchSessions = async () => {
    try {
      const res = await fetch('http://localhost:3001/sessions');
      const data = await res.json();
      setSessions(data);
    } catch (err) {
      console.error('Failed to fetch sessions', err);
    }
  };

  const createSession = async () => {
    try {
      await fetch('http://localhost:3001/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Session ${sessions.length + 1}` })
      });
      fetchSessions();
    } catch (err) {
      console.error('Failed to create session', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex flex-col h-screen">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 tracking-tight block">Tensix</Link>
        <button
          onClick={createSession}
          className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <PlusCircle className="w-4 h-4" />
          New Session
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="text-[10px] font-bold text-zinc-600 dark:text-zinc-600 uppercase tracking-wider px-3 mb-2">
          Recent Sessions
        </div>
        <div className="space-y-1">
          {sessions.map((session) => (
            <Link
              key={session.id}
              href={`/sessions?id=${session.id}`}
              className={`w-full text-left p-3 rounded-lg flex flex-col gap-1 transition-colors group ${
                pathname === '/sessions' && currentId === session.id
                  ? 'bg-zinc-200 dark:bg-zinc-800'
                  : 'hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className={`w-4 h-4 ${
                  pathname === '/sessions' && currentId === session.id
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-600'
                }`} />
                <span className={`text-sm font-bold truncate ${
                  pathname === '/sessions' && currentId === session.id
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}>
                  {session.title}
                </span>
              </div>
              <div className="flex items-center gap-1 ml-7">
                <Clock className="w-3 h-3 text-zinc-600 dark:text-zinc-600" />
                <span className="text-[10px] text-zinc-600 dark:text-zinc-600 uppercase font-bold tracking-tight">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
        <Link
          href="/settings"
          className={`flex items-center gap-2 text-sm font-medium p-2 rounded-lg transition-colors ${
            pathname === '/settings'
              ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
              : 'text-zinc-600 dark:text-zinc-600 hover:bg-zinc-200 dark:hover:bg-zinc-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
        <StatusIndicator />
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense fallback={<div className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 h-screen" />}>
      <SidebarContent />
    </Suspense>
  );
}
