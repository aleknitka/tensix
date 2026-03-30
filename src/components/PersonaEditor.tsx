'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, UserCircle } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  modelId: string;
  providerId: string;
}

interface Model {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
}

export default function PersonaEditor() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Persona>>({});
  const [isAdding, setIsAdding] = useState(false);

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
    } catch (err) {
      console.error('Failed to fetch models', err);
    }
  };

  useEffect(() => {
    fetchPersonas();
    fetchModels();
  }, []);

  const handleSave = async () => {
    if (!editForm.name || !editForm.providerId || !editForm.modelId) return;

    try {
      const url = editingId 
        ? `http://localhost:3001/personas/${editingId}`
        : 'http://localhost:3001/personas';
      const method = editingId ? 'PUT' : 'POST';

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      setEditingId(null);
      setIsAdding(false);
      setEditForm({});
      fetchPersonas();
    } catch (err) {
      console.error('Failed to save persona', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this persona?')) return;
    try {
      await fetch(`http://localhost:3001/personas/${id}`, { method: 'DELETE' });
      fetchPersonas();
    } catch (err) {
      console.error('Failed to delete persona', err);
    }
  };

  const startEdit = (p: Persona) => {
    setEditingId(p.id);
    setEditForm(p);
    setIsAdding(false);
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      name: '',
      role: '',
      systemPrompt: '',
      providerId: models[0]?.providerId || '',
      modelId: models[0]?.id || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Custom Personas</h2>
        {!isAdding && !editingId && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            Create Persona
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg">{editingId ? 'Edit Persona' : 'New Persona'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500">Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. The Contrarian"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500">Role/Title</label>
              <input
                type="text"
                value={editForm.role}
                onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Critical Thinking Expert"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-500">System Prompt</label>
            <textarea
              value={editForm.systemPrompt}
              onChange={e => setEditForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
              placeholder="Instructions for how this persona should behave..."
              rows={4}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-500">Model</label>
              <select
                value={`${editForm.providerId}:${editForm.modelId}`}
                onChange={e => {
                  const [providerId, modelId] = e.target.value.split(':');
                  setEditForm(prev => ({ ...prev, providerId, modelId }));
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                {models.map(m => (
                  <option key={`${m.providerId}:${m.id}`} value={`${m.providerId}:${m.id}`}>
                    [{m.providerName}] {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Persona
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map(p => (
          <div
            key={p.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">{p.name}</div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">{p.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(p)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-zinc-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-500 line-clamp-2 italic">
              "{p.systemPrompt}"
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Assigned Model:</span>
              <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500">
                {p.modelId}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
