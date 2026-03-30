'use client';

import ProviderConfigForm from '@/components/ProviderConfigForm';
import ModelSelector from '@/components/ModelSelector';
import PersonaEditor from '@/components/PersonaEditor';
import { Settings as SettingsIcon, Cpu, Globe, Users, Trash2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const handleReset = async () => {
    if (!confirm('CRITICAL: This will delete ALL providers, personas, sessions, and messages. This cannot be undone. Are you sure?')) return;
    try {
      await fetch('http://localhost:3001/system/reset', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Reset failed', err);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-32">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-zinc-400" />
          Settings
        </h1>
        <p className="text-zinc-500 mt-2">
          Configure your LLM providers, model connections, and custom personas.
        </p>
      </div>

      <div className="space-y-16">
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Globe className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">LLM Providers</h2>
          </div>
          <ProviderConfigForm />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Users className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">Persona Management</h2>
          </div>
          <PersonaEditor />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Cpu className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">Model Management</h2>
          </div>
          <ModelSelector />
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-8">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h2 className="text-xl font-bold uppercase tracking-tight">Danger Zone</h2>
            </div>
            <p className="text-sm text-rose-600/80 dark:text-rose-400/80 mb-6 font-medium">
              Resetting the system will permanently delete all your data, including providers, custom personas, and session history.
            </p>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-rose-600/20 active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
              Reset System & Clear All Data
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
