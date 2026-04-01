'use client';

import { Users, FileText, GitBranch, Settings, Wrench } from 'lucide-react';

export type SidebarTabId = 'team' | 'docs' | 'branches' | 'settings' | 'tools';

interface SidebarTabsProps {
  activeTab: SidebarTabId;
  onTabChange: (tab: SidebarTabId) => void;
}

export default function SidebarTabs({ activeTab, onTabChange }: SidebarTabsProps) {
  const tabs: { id: SidebarTabId; icon: React.ElementType; label: string }[] = [
    { id: 'team', icon: Users, label: 'Team' },
    { id: 'docs', icon: FileText, label: 'Context/Docs' },
    { id: 'tools', icon: Wrench, label: 'Tools' },
    { id: 'branches', icon: GitBranch, label: 'Branches' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-6 shadow-inner">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
            className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-all ${
              isActive
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm border border-zinc-200 dark:border-zinc-700'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 border border-transparent'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        );
      })}
    </div>
  );
}
