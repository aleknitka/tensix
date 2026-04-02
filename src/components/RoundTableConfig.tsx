'use client';

import { useState, useEffect } from 'react';
import { Play, UserPlus, BrainCircuit, CheckCircle2, Square, SkipForward, Library, X, Check } from 'lucide-react';
import RoleSelector from './RoleSelector';

interface Persona {
  id: string;
  name: string;
  role: string;
  modelId?: string | null;
  providerId?: string | null;
  is_predefined?: boolean;
}

interface Model {
  id: string;
  name: string;
  providerId: string;
}

interface RoundTableConfigProps {
  sessionId: string;
  onStartEvaluation: (personaIds: string[], overrideMode?: string, overrideMaxTurns?: number) => void;
  onStopEvaluation: () => void;
  isEvaluating: boolean;
}

export default function RoundTableConfig({ sessionId, onStartEvaluation, onStopEvaluation, isEvaluating }: RoundTableConfigProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<string[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [assigningModelPersona, setAssigningModelPersona] = useState<Persona | null>(null);

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

  useEffect(() => {
    fetchPersonas();
    fetchModels();
  }, []);

  const togglePersona = (id: string) => {
    setSelectedPersonaIds(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleRoleSelect = (p: Persona) => {
    setIsLibraryOpen(false);
    if (!p.modelId || !p.providerId) {
      setAssigningModelPersona(p);
    } else {
      // Already has a model, just add to selected
      if (!selectedPersonaIds.includes(p.id)) {
        setSelectedPersonaIds(prev => [...prev, p.id]);
      }
    }
  };

  const handleAssignModel = async () => {
    if (!assigningModelPersona || !selectedModel) return;
    const [providerId, modelId] = selectedModel.split(':');
    
    try {
      await fetch(`http://localhost:3001/personas/${assigningModelPersona.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, modelId })
      });
      
      await fetchPersonas();
      setSelectedPersonaIds(prev => [...prev, assigningModelPersona.id]);
      setAssigningModelPersona(null);
    } catch (err) {
      console.error('Failed to assign model', err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-zinc-600" />
          Round Table
        </h2>
        <div className="flex items-center gap-3">
          {!isEvaluating && (
            <button
              onClick={() => setIsLibraryOpen(true)}
              className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold text-sm transition-colors"
            >
              <Library className="w-4 h-4" />
              Role Library
            </button>
          )}
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
      </div>

      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
              <div>
                <h3 className="text-lg font-bold">Select from Library</h3>
                <p className="text-xs text-zinc-600 mt-0.5 font-medium">Add specialized roles to the discussion</p>
              </div>
              <button onClick={() => setIsLibraryOpen(false)} className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <RoleSelector onSelect={handleRoleSelect} />
            </div>
          </div>
        </div>
      )}

      {assigningModelPersona && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-500" />
              Assign Model
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              Choose an LLM model to power <span className="text-zinc-900 dark:text-zinc-100 font-bold">{assigningModelPersona.name}</span> for this and future sessions.
            </p>
            <div className="space-y-4 py-2">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                {models.map(m => (
                  <option key={`${m.providerId}:${m.id}`} value={`${m.providerId}:${m.id}`}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setAssigningModelPersona(null)}
                className="px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignModel}
                disabled={!selectedModel}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-xl text-sm font-bold hover:opacity-90 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Assign & Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase text-zinc-600 tracking-wider">Select Participants</h3>
          {!isEvaluating && (
            <button 
              onClick={() => setSelectedPersonaIds(personas.map(p => p.id))}
              className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              Select All
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {personas.length === 0 && (
            <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
              <p className="text-zinc-600 text-sm font-medium">No roles added yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Use "Role Library" to add specialized experts.</p>
            </div>
          )}
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
                    ? 'bg-zinc-900 dark:border-zinc-100 border-zinc-900 dark:border-zinc-100'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}>
                  {selectedPersonaIds.includes(p.id) && <CheckCircle2 className="w-3 h-3 text-white dark:text-zinc-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm leading-none mb-1 flex items-center gap-2">
                    {p.name}
                    {p.is_predefined && (
                      <span className="text-[9px] font-bold uppercase text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1 py-0.5 rounded">
                        Library
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-wide truncate">{p.role}</div>
                </div>
                {p.modelId && (
                   <div className="text-[9px] font-mono text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded self-center">
                    {p.modelId}
                  </div>
                )}
              </button>
              {!isEvaluating && (
                <button
                  onClick={() => onStartEvaluation([p.id], 'sequential', 1)}
                  disabled={!p.modelId}
                  title={p.modelId ? "Force this expert to speak now" : "Assign a model first"}
                  className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
