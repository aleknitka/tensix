'use client';

import React from 'react';
import * as Icons from 'lucide-react';
import { 
  Shield, Zap, FileText, Search, Brain, Feather, Code, 
  MessageSquare, Terminal, Lock, Database, Microscope, 
  Flame, Coffee, Globe, UserCircle 
} from 'lucide-react';

const ICON_LIST = [
  { id: 'shield', icon: Shield },
  { id: 'zap', icon: Zap },
  { id: 'file-text', icon: FileText },
  { id: 'search', icon: Search },
  { id: 'brain', icon: Brain },
  { id: 'feather', icon: Feather },
  { id: 'code', icon: Code },
  { id: 'message-square', icon: MessageSquare },
  { id: 'terminal', icon: Terminal },
  { id: 'lock', icon: Lock },
  { id: 'database', icon: Database },
  { id: 'microscope', icon: Microscope },
  { id: 'flame', icon: Flame },
  { id: 'coffee', icon: Coffee },
  { id: 'globe', icon: Globe },
  { id: 'user-circle', icon: UserCircle },
];

interface IconPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
  colorAccent?: string;
}

export default function IconPicker({ selectedId, onChange, colorAccent = 'slate' }: IconPickerProps) {
  return (
    <div className="grid grid-cols-8 gap-2">
      {ICON_LIST.map(({ id, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`p-2 rounded-lg border transition-all ${
            selectedId === id
              ? `bg-zinc-100 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-100 scale-110 z-10 shadow-sm`
              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-500'
          }`}
          title={id}
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}

export function getIconById(id: string) {
  const item = ICON_LIST.find(i => i.id === id);
  return item ? item.icon : UserCircle;
}
