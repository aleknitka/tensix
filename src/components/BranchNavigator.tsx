'use client';

import React, { useState, useEffect } from 'react';
import { GitBranch, ChevronRight, GitCommit } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SessionNode {
  id: string;
  title: string;
  parentId: string | null;
  createdAt: string;
}

interface BranchNavigatorProps {
  currentSessionId: string;
}

export default function BranchNavigator({ currentSessionId }: BranchNavigatorProps) {
  const [sessions, setSessions] = useState<SessionNode[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchTree = async () => {
      try {
        // Fetch all sessions to build the local tree
        // In a real app, we'd have a specific /sessions/:id/tree endpoint
        const res = await fetch('http://localhost:3001/sessions');
        const data = await res.json();
        setSessions(data);
      } catch (err) {
        console.error('Failed to fetch session tree', err);
      }
    };
    fetchTree();
  }, [currentSessionId]);

  // Find all related sessions (ancestors and descendants)
  const buildFamily = () => {
    const family = new Set<string>();
    const current = sessions.find(s => s.id === currentSessionId);
    if (!current) return [];

    // Traverse up to find root
    let rootId = current.id;
    let parentNode = sessions.find(s => s.id === current.parentId);
    while (parentNode) {
      rootId = parentNode.id;
      parentNode = sessions.find(s => s.id === parentNode?.parentId);
    }

    // Traverse down from root to find all descendants
    const addDescendants = (id: string) => {
      family.add(id);
      sessions.filter(s => s.parentId === id).forEach(s => addDescendants(s.id));
    };
    addDescendants(rootId);

    return sessions.filter(s => family.has(s.id)).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  };

  const familyNodes = buildFamily();

  if (familyNodes.length <= 1) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-zinc-500 mb-2">
        <GitBranch className="w-3.5 h-3.5" />
        Conversation Branches
      </div>
      
      <div className="space-y-1">
        {familyNodes.map((s) => (
          <button
            key={s.id}
            onClick={() => router.push(`/sessions?id=${s.id}`)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              s.id === currentSessionId
                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold border-l-2 border-zinc-900 dark:border-zinc-100'
                : 'text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
            }`}
          >
            {s.parentId ? <GitCommit className="w-3.5 h-3.5 ml-2 opacity-50" /> : <GitBranch className="w-3.5 h-3.5" />}
            <span className="truncate">{s.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
