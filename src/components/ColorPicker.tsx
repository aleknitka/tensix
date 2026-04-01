'use client';

import React from 'react';

const COLORS = [
  { id: 'blue', class: 'bg-blue-500', name: 'Blue' },
  { id: 'green', class: 'bg-emerald-500', name: 'Green' },
  { id: 'amber', class: 'bg-amber-500', name: 'Amber' },
  { id: 'rose', class: 'bg-rose-500', name: 'Rose' },
  { id: 'violet', class: 'bg-violet-500', name: 'Violet' },
  { id: 'cyan', class: 'bg-cyan-500', name: 'Cyan' },
  { id: 'orange', class: 'bg-orange-500', name: 'Orange' },
  { id: 'slate', class: 'bg-slate-500', name: 'Slate' },
];

interface ColorPickerProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export default function ColorPicker({ selectedId, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {COLORS.map((color) => (
        <button
          key={color.id}
          type="button"
          onClick={() => onChange(color.id)}
          className={`w-8 h-8 rounded-full border-2 transition-all ${
            selectedId === color.id
              ? 'border-zinc-900 dark:border-zinc-100 scale-125 shadow-md'
              : 'border-transparent hover:scale-110'
          } ${color.class}`}
          title={color.name}
        />
      ))}
    </div>
  );
}

export function getColorClass(id: string) {
  const color = COLORS.find(c => c.id === id);
  return color ? color.class : 'bg-slate-500';
}

export function getBorderColorClass(id: string) {
  switch (id) {
    case 'blue': return 'border-blue-500';
    case 'green': return 'border-emerald-500';
    case 'amber': return 'border-amber-500';
    case 'rose': return 'border-rose-500';
    case 'violet': return 'border-violet-500';
    case 'cyan': return 'border-cyan-500';
    case 'orange': return 'border-orange-500';
    default: return 'border-slate-500';
  }
}

export function getTextColorClass(id: string) {
  switch (id) {
    case 'blue': return 'text-blue-500';
    case 'green': return 'text-emerald-500';
    case 'amber': return 'text-amber-500';
    case 'rose': return 'text-rose-500';
    case 'violet': return 'text-violet-500';
    case 'cyan': return 'text-cyan-500';
    case 'orange': return 'text-orange-500';
    default: return 'text-slate-500';
  }
}
