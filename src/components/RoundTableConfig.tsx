'use client';

import { useState, useEffect } from 'react';
import { Play, UserPlus, BrainCircuit, CheckCircle2, Square, SkipForward } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
}

interface Model {
  id: string;
  name: string;
  providerId: string;
}

interface RoundTableConfigProps {
  sessionId: string;
  onStartEvaluation: (personaIds: string[]) => void;
  onStopEvaluation: () => void;
  isEvaluating: boolean;
}

export default function RoundTableConfig({ sessionId, onStartEvaluation, onStopEvaluation, isEvaluating }: RoundTableConfigProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [seeding, setSeeding] = useState(false);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('http://localhost:3001/personas');
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      console.error('Failed to fetch personas', err);
    }
  };

  const fetchModels = async () => {
    try {
      const res = await fetch('http://localhost:3001/models');
      const data = await res.json();
      setModels(data);
      if (data.length > 0) setSelectedModel(`${data[0].providerId}:${data[0].id}`);
    } catch (err) {
      console.error('Failed to fetch models', err);
    }
  };

  const seedHats = async () => {
    if (!selectedModel) return;
    setSeeding(true);
    const [providerId, modelId] = selectedModel.split(':');
    try {
      await fetch('http://localhost:3001/personas/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, modelId })
      });
      fetchPersonas();
    } catch (err) {
      console.error('Failed to seed hats', err);
    } finally {
      setSeeding(false);
    }
  };

  useEffect(() => {
    fetchPersonas();
    fetchModels();
  }, []);

  const togglePersona = (id: string) => {
    setSelectedPersonaIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-zinc-400" />
          Round Table
        </h2>
        {isEvaluating ? (
          <button
            onClick={onStopEvaluation}
            className="flex items-center gap-2 bg-rose-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-600 transition-all shadow-md active:scale-95 animate-pulse"
          >
            <Square className="w-4 h-4 fill-current" />
            Stop
          </button>
        ) : (
          <button
            onClick={() => onStartEvaluation(selectedPersonaIds)}
            disabled={selectedPersonaIds.length === 0}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 transition-all shadow-md active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Audit
          </button>
        )}
      </div>

      {personas.length === 0 ? (
        <div className="p-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center space-y-4">
          <p className="text-zinc-500">No personas found. Seed the "Six Thinking Hats" to get started.</p>
          <div className="flex items-center justify-center gap-2 max-w-sm mx-auto">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="flex-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
            >
              {models.map(m => (
                <option key={`${m.providerId}:${m.id}`} value={`${m.providerId}:${m.id}`}>
                  {m.name}
                </option>
              ))}
            </select>
            <button
              onClick={seedHats}
              disabled={seeding || !selectedModel}
              className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50"
            >
              Seed Hats
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-zinc-500 tracking-wider">Select Participants</h3>
            {!isEvaluating && (
              <button 
                onClick={() => setSelectedPersonaIds(personas.map(p => p.id))}
                className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Select All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {personas.map(p => (
              <div key={p.id} className="flex gap-2">
                <button
                  onClick={() => togglePersona(p.id)}
                  disabled={isEvaluating}
                  className={`flex-1 flex items-start gap-3 p-3 rounded-xl border transition-all text-left group ${
                    selectedPersonaIds.includes(p.id)
                      ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-900/5 dark:bg-zinc-100/5'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900'
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    selectedPersonaIds.includes(p.id)
                      ? 'bg-zinc-900 dark:bg-zinc-100 border-zinc-900 dark:border-zinc-100'
                      : 'border-zinc-300 dark:border-zinc-600'
                  }`}>
                    {selectedPersonaIds.includes(p.id) && <CheckCircle2 className="w-3 h-3 text-white dark:text-zinc-900" />}
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-none mb-1">{p.name}</div>
                    <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide">{p.role}</div>
                  </div>
                </button>
                {!isEvaluating && (
                  <button
                    onClick={() => onStartEvaluation([p.id])}
                    title="Force this expert to speak now"
                    className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
