'use client';

import { useState, useEffect } from 'react';
import { Cpu, RefreshCw, CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
  size?: number;
  details?: any;
}

export default function ModelSelector() {
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/models');
      const data = await res.json();
      setModels(data);
    } catch (err) {
      console.error('Failed to fetch models', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(1)} GB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-wider">Available Models</h3>
        <button
          onClick={fetchModels}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((model) => (
          <div
            key={`${model.providerId}-${model.id}`}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 truncate max-w-[150px]" title={model.name}>
                    {model.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400">
                    {model.providerName}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                  {formatSize(model.size)}
                </span>
                {model.id.toLowerCase().includes('instruct') || model.id.toLowerCase().includes('chat') ? (
                  <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold uppercase">
                    <CheckCircle2 className="w-3 h-3" /> Compatible
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-zinc-400 text-[10px] font-bold uppercase">
                    <Info className="w-3 h-3" /> Base Model
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {models.length === 0 && !loading && (
          <div className="col-span-full py-8 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <p className="text-zinc-500 text-sm">No models found. Check your provider connections.</p>
          </div>
        )}
      </div>
    </div>
  );
}
