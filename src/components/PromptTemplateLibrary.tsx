'use client';

import React from 'react';
import { Lightbulb, HelpCircle, Zap, MessageSquare } from 'lucide-react';

const TEMPLATES = [
  {
    name: 'Chain of Thought',
    icon: Lightbulb,
    description: 'Forces step-by-step reasoning.',
    suffix: '\n\nThink step-by-step before providing your final answer. Externalize your reasoning process.'
  },
  {
    name: 'Socratic Method',
    icon: HelpCircle,
    description: 'Persona asks questions instead of giving answers.',
    suffix: '\n\nDo not give direct answers. Instead, ask guiding questions to help the user discover the answer themselves.'
  },
  {
    name: 'Direct & Concise',
    icon: Zap,
    description: 'Removes fluff and introductory filler.',
    suffix: '\n\nProvide direct, concise answers without fluff or unnecessary explanations.'
  },
  {
    name: 'Critique & Refine',
    icon: MessageSquare,
    description: 'Evaluates own reasoning after responding.',
    suffix: '\n\nAfter providing an answer, critique your own reasoning and suggest an improved version.'
  }
];

interface PromptTemplateLibraryProps {
  onSelect: (suffix: string) => void;
}

export default function PromptTemplateLibrary({ onSelect }: PromptTemplateLibraryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {TEMPLATES.map((t) => (
        <button
          key={t.name}
          type="button"
          onClick={() => onSelect(t.suffix)}
          className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-zinc-100 text-left transition-all group"
        >
          <div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
            <t.icon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{t.name}</div>
            <div className="text-[10px] text-zinc-500">{t.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
