'use client';

import { useState, useRef } from 'react';
import ProviderConfigForm from '@/components/ProviderConfigForm';
import ModelSelector from '@/components/ModelSelector';
import PersonaEditor from '@/components/PersonaEditor';
import { Settings as SettingsIcon, Cpu, Globe, Users, Trash2, AlertTriangle, Library, Upload, CheckCircle2 } from 'lucide-react';
import yaml from 'js-yaml';
import { roleSchema } from '@/server/services/role-schema';

export default function SettingsPage() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = async () => {
    if (!confirm('CRITICAL: This will delete ALL providers, personas, sessions, and messages. This cannot be undone. Are you sure?')) return;
    try {
      await fetch('http://localhost:3001/system/reset', { method: 'POST' });
      window.location.reload();
    } catch (err) {
      console.error('Reset failed', err);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        const rawData = yaml.load(content);
        const validated = roleSchema.parse(rawData);

        // Fetch models to assign the first available one as default
        const modelsRes = await fetch('http://localhost:3001/models');
        const models = await modelsRes.json();
        
        if (models.length === 0) {
          throw new Error('No models available. Please configure a provider first.');
        }

        const res = await fetch('http://localhost:3001/personas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...validated,
            role: (validated as any).role || validated.role_type,
            providerId: models[0].providerId,
            modelId: models[0].id,
            is_predefined: false // imported roles are custom
          })
        });

        if (!res.ok) throw new Error('Failed to save imported role');

        setImportStatus({ type: 'success', message: `Imported role: ${validated.name}` });
        setTimeout(() => setImportStatus(null), 5000);
        window.location.reload(); // Refresh to show new role
      } catch (err: any) {
        console.error('Import failed', err);
        setImportStatus({ type: 'error', message: err.message || 'Invalid YAML or schema' });
      }
    };
    reader.readAsText(file);
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
          <div className="flex items-center justify-between mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-zinc-400" />
              <h2 className="text-xl font-semibold">Persona Management</h2>
            </div>
            <div className="flex items-center gap-4">
              {importStatus && (
                <div className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-in fade-in zoom-in ${
                  importStatus.type === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {importStatus.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {importStatus.message}
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImport} 
                accept=".yml,.yaml" 
                className="hidden" 
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                <Upload className="w-3 h-3" />
                Import Role (YAML)
              </button>
            </div>
          </div>
          <PersonaEditor />
        </section>

        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-2">
            <Library className="w-5 h-5 text-zinc-400" />
            <h2 className="text-xl font-semibold">Role Library</h2>
          </div>
          <PersonaEditor isLibrary={true} />
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
