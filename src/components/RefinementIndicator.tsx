'use client';

import { Bot } from 'lucide-react';

interface RefinementIndicatorProps {
  status: 'refining' | 'active' | 'completed';
}

export default function RefinementIndicator({ status }: RefinementIndicatorProps) {
  if (status !== 'refining') return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-indigo-800 shadow-sm animate-pulse">
      <Bot className="w-3 h-3" />
      <span className="text-[10px] font-black uppercase tracking-widest">Refinement Active</span>
    </div>
  );
}
