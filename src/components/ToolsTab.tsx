'use client';

import { Wrench, Calculator, FileSearch, Code2, ShieldAlert } from 'lucide-react';

interface ToolDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'active' | 'beta' | 'planned';
}

const TOOLS: ToolDef[] = [
  {
    id: 'calculator',
    name: 'Calculator',
    description: 'Evaluates mathematical expressions to ensure accurate calculations during debates.',
    icon: Calculator,
    status: 'active'
  },
  {
    id: 'read_file',
    name: 'File Reader',
    description: 'Reads content from uploaded session documents to provide exact context.',
    icon: FileSearch,
    status: 'active'
  },
  {
    id: 'web_search',
    name: 'Web Search',
    description: 'Queries the internet for up-to-date information.',
    icon: Code2,
    status: 'planned'
  }
];

export default function ToolsTab() {
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-extrabold uppercase text-zinc-600 mb-3 flex items-center gap-2 tracking-wider">
          <Wrench className="w-3.5 h-3.5" />
          Active Capabilities
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-600 leading-relaxed font-medium">
          Personas assigned to this session can autonomously use the following tools when they need external information or capabilities.
        </p>
      </div>

      <div className="grid gap-3">
        {TOOLS.map(tool => {
          const Icon = tool.icon;
          return (
            <div key={tool.id} className="flex gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="w-10 h-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0 text-zinc-600">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{tool.name}</span>
                  {tool.status === 'active' && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                      Enabled
                    </span>
                  )}
                  {tool.status === 'planned' && (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-600 dark:text-zinc-600 leading-relaxed font-medium">
                  {tool.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 flex gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
        <p className="text-xs font-medium text-amber-800 dark:text-amber-400 leading-relaxed">
          Tools are executed locally. Ensure you trust the models running these functions, especially for file operations.
        </p>
      </div>
    </div>
  );
}
