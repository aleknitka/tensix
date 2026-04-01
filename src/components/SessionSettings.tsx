'use client';

import { Download, FileText, Loader2, Settings } from 'lucide-react';

interface SessionSettingsProps {
  mode: 'sequential' | 'auto' | 'hitl';
  onModeChange: (mode: 'sequential' | 'auto' | 'hitl') => void;
  maxTurns: number;
  onMaxTurnsChange: (turns: number) => void;
  onExportJson: () => void;
  onExportMarkdown: () => void;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  hasMessages: boolean;
}

export default function SessionSettings({
  mode,
  onModeChange,
  maxTurns,
  onMaxTurnsChange,
  onExportJson,
  onExportMarkdown,
  onGenerateReport,
  isGeneratingReport,
  hasMessages
}: SessionSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2 tracking-wider">
          <Settings className="w-3.5 h-3.5" />
          Orchestration Configuration
        </h3>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-400">Orchestration Mode</label>
            <div className="grid grid-cols-3 gap-2">
              {(['sequential', 'auto', 'hitl'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => onModeChange(m)}
                  className={`px-2 py-2 rounded-lg text-[10px] font-bold uppercase border transition-all ${
                    mode === m 
                      ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100' 
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-zinc-500 font-medium">
              {mode === 'sequential' && 'Evaluates experts one after another to save VRAM.'}
              {mode === 'auto' && 'Blue Hat automatically chooses the next speaker.'}
              {mode === 'hitl' && 'Human-in-the-loop: approve next speakers manually.'}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-400 flex justify-between">
              Max Turns per Session <span>{maxTurns}</span>
            </label>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={maxTurns}
              onChange={(e) => onMaxTurnsChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-6">
        <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2 tracking-wider">
          <Download className="w-3.5 h-3.5" />
          Export & Reporting
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onGenerateReport}
            disabled={isGeneratingReport || !hasMessages}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-md active:scale-95 hover:bg-blue-700"
          >
            {isGeneratingReport ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Generate Audit Report
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onExportJson}
              disabled={!hasMessages}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              Export JSON
            </button>
            <button
              onClick={onExportMarkdown}
              disabled={!hasMessages}
              className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 rounded-xl transition-colors disabled:opacity-50"
            >
              <FileText className="w-3.5 h-3.5" />
              Export MD
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
