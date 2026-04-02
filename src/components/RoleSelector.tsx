'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Info, ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
  description: string;
  role_type?: string;
  category?: string;
  icon_id?: string;
  color_accent?: string;
  is_predefined: boolean;
}

interface RoleSelectorProps {
  onSelect: (persona: Persona) => void;
  excludeIds?: string[];
}

const DEFAULT_EXCLUDE: string[] = [];

export default function RoleSelector({ onSelect, excludeIds = DEFAULT_EXCLUDE }: RoleSelectorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchPersonas = async () => {
      setLoading(true);
      try {
        const res = await fetch('http://localhost:3001/personas');
        const data = await res.json();
        // Filter for predefined roles and exclude those already in the session
        const filtered = data.filter((p: Persona) => p.is_predefined && !excludeIds.includes(p.id));
        setPersonas(filtered);
      } catch (err) {
        console.error('Failed to fetch personas', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, [excludeIds]);

  const filteredPersonas = useMemo(() => personas.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.role.toLowerCase().includes(search.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  ), [personas, search]);

  const groupedPersonas = useMemo(() => {
    const groups: Record<string, Persona[]> = {};
    filteredPersonas.forEach(p => {
      const cat = p.category || 'general';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(p);
    });
    return groups;
  }, [filteredPersonas]);

  // Auto-expand categories with matches when searching
  useEffect(() => {
    if (search.trim()) {
      const newCollapsed: Record<string, boolean> = {};
      Object.keys(groupedPersonas).forEach(cat => {
        newCollapsed[cat] = false;
      });
      setCollapsedCategories(newCollapsed);
    }
  }, [search, groupedPersonas]);

  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getRoleIcon = (iconId?: string) => {
    if (!iconId) return <UserPlus className="w-4 h-4" />;
    
    // LucideIcons is an object with all icons
    const Icon = (LucideIcons as any)[iconId] as LucideIcon;
    if (Icon) return <Icon className="w-4 h-4" />;
    
    return <UserPlus className="w-4 h-4" />;
  };

  const getColorClass = (color?: string) => {
    switch (color) {
      case 'red': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'blue': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'green': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'yellow': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'orange': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'purple': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'pink': return 'text-pink-500 bg-pink-500/10 border-pink-500/20';
      case 'cyan': return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
      case 'slate': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
      default: return 'text-zinc-500 bg-white dark:bg-zinc-800 border-zinc-100 dark:border-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Search roles (e.g. 'auditor', 'black hat')..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {loading ? (
          <div className="py-8 text-center text-zinc-500 text-sm italic">Loading roles...</div>
        ) : Object.keys(groupedPersonas).length > 0 ? (
          Object.entries(groupedPersonas).map(([category, roles]) => (
            <div key={category} className="space-y-2">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center gap-2 w-full text-left px-2 py-1 group"
              >
                {collapsedCategories[category] ? (
                  <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
                )}
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-700 transition-colors">
                  {category}
                </span>
                <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-full">
                  {roles.length}
                </span>
              </button>

              {!collapsedCategories[category] && (
                <div className="grid gap-2 pl-2">
                  {roles.map((persona) => (
                    <button
                      key={persona.id}
                      onClick={() => onSelect(persona)}
                      className="w-full text-left bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:border-blue-500/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all group relative overflow-hidden"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl shadow-sm group-hover:scale-110 transition-all ${getColorClass(persona.color_accent)}`}>
                          {getRoleIcon(persona.icon_id)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {persona.name}
                            </span>
                            {persona.role_type && (
                              <span className="px-1.5 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                                {persona.role_type}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed line-clamp-2">
                            {persona.description || persona.role}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <Info className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-500 text-sm font-medium">No matching roles found.</p>
            <p className="text-zinc-400 text-xs mt-1">Try a different search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
