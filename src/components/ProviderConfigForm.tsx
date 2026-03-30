'use client';

import { useState, useEffect } from 'react';
import { Save, Trash2, CheckCircle2, AlertCircle, RefreshCw, Plus } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  type: 'ollama' | 'lmstudio' | 'openrouter';
  baseUrl?: string;
  apiKey?: string;
  isEnabled: boolean;
}

export default function ProviderConfigForm() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [newProvider, setNewProvider] = useState<Partial<Provider>>({
    name: '',
    type: 'ollama',
    baseUrl: 'http://localhost:11434',
    isEnabled: true
  });
  const [checkingStatus, setCheckingStatus] = useState<Record<string, boolean>>({});
  const [statusResults, setStatusResults] = useState<Record<string, 'ok' | 'error' | null>>({});

  const fetchProviders = async () => {
    try {
      const res = await fetch('http://localhost:3001/providers');
      const data = await res.json();
      setProviders(data);
    } catch (err) {
      console.error('Failed to fetch providers', err);
    }
  };

  const addProvider = async () => {
    if (!newProvider.name) return;
    try {
      await fetch('http://localhost:3001/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });
      setNewProvider({ name: '', type: 'ollama', baseUrl: 'http://localhost:11434', isEnabled: true });
      fetchProviders();
    } catch (err) {
      console.error('Failed to add provider', err);
    }
  };

  const deleteProvider = async (id: string) => {
    try {
      await fetch(`http://localhost:3001/providers/${id}`, { method: 'DELETE' });
      fetchProviders();
    } catch (err) {
      console.error('Failed to delete provider', err);
    }
  };

  const checkProviderStatus = async (id: string) => {
    setCheckingStatus(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(`http://localhost:3001/providers/${id}/check`);
      const data = await res.json();
      setStatusResults(prev => ({ ...prev, [id]: data.status }));
    } catch (err) {
      setStatusResults(prev => ({ ...prev, [id]: 'error' }));
    } finally {
      setCheckingStatus(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add New Provider</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500">Name</label>
            <input
              type="text"
              value={newProvider.name}
              onChange={e => setNewProvider(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Local Ollama"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500">Type</label>
            <select
              value={newProvider.type}
              onChange={e => {
                const type = e.target.value as any;
                let baseUrl = '';
                if (type === 'ollama') baseUrl = 'http://localhost:11434';
                if (type === 'lmstudio') baseUrl = 'http://localhost:1234';
                setNewProvider(prev => ({ ...prev, type, baseUrl }));
              }}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
            >
              <option value="ollama">Ollama</option>
              <option value="lmstudio">LM Studio</option>
              <option value="openrouter">OpenRouter</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-1 lg:col-span-1">
            <label className="text-xs font-bold uppercase text-zinc-500">
              {newProvider.type === 'openrouter' ? 'API Key' : 'Base URL'}
            </label>
            <input
              type={newProvider.type === 'openrouter' ? 'password' : 'text'}
              value={newProvider.type === 'openrouter' ? newProvider.apiKey : newProvider.baseUrl}
              onChange={e => {
                if (newProvider.type === 'openrouter') {
                  setNewProvider(prev => ({ ...prev, apiKey: e.target.value }));
                } else {
                  setNewProvider(prev => ({ ...prev, baseUrl: e.target.value }));
                }
              }}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none"
            />
          </div>
          <button
            onClick={addProvider}
            disabled={!newProvider.name}
            className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-2 px-4 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Configured Providers</h2>
        <div className="grid grid-cols-1 gap-4">
          {providers.map(p => (
            <div
              key={p.id}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center uppercase font-bold text-zinc-500">
                  {p.type[0]}
                </div>
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                  <div className="text-xs text-zinc-500 font-mono">
                    {p.type === 'openrouter' ? '••••••••' : p.baseUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 mr-4">
                  {statusResults[p.id] === 'ok' && (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Online
                    </div>
                  )}
                  {statusResults[p.id] === 'error' && (
                    <div className="flex items-center gap-1 text-rose-500 text-xs font-medium">
                      <AlertCircle className="w-3 h-3" /> Offline
                    </div>
                  )}
                </div>

                <button
                  onClick={() => checkProviderStatus(p.id)}
                  disabled={checkingStatus[p.id]}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500"
                  title="Check connection"
                >
                  <RefreshCw className={`w-4 h-4 ${checkingStatus[p.id] ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => deleteProvider(p.id)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors text-zinc-500 hover:text-rose-500"
                  title="Remove provider"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {providers.length === 0 && (
            <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-500 text-sm">No providers configured yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
