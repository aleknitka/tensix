'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Trash2, Edit2, Save, X, UserCircle, Download, 
  Copy, Shield, Zap, FileText, UserPlus, Sliders, Palette, Tag, Play, StopCircle, RefreshCw, BookOpen
} from 'lucide-react';
import yaml from 'js-yaml';
import IconPicker, { getIconById } from './IconPicker';
import ColorPicker, { getBorderColorClass, getTextColorClass } from './ColorPicker';
import PromptTemplateLibrary from './PromptTemplateLibrary';
import Markdown from './Markdown';

interface Persona {
  id: string;
  name: string;
  role: string;
  description?: string;
  systemPrompt: string;
  modelId: string | null;
  providerId: string | null;
  chattiness_limit?: number | null;
  role_type?: string | null;
  is_predefined: boolean;
  temperature?: number | null;
  top_p?: number | null;
  max_tokens?: number | null;
  presence_penalty?: number | null;
  frequency_penalty?: number | null;
  icon_id?: string | null;
  color_accent?: string | null;
  skills?: string[] | null;
}

interface Model {
  id: string;
  name: string;
  providerId: string;
  providerName: string;
}

interface PersonaEditorProps {
  isLibrary?: boolean;
}

export default function PersonaEditor({ isLibrary = false }: PersonaEditorProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Persona>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // Sandbox state
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPersonas = async () => {
    try {
      const res = await fetch('http://localhost:3001/personas');
      const data = await res.json();
      const parsedData = data.map((p: any) => ({
        ...p,
        skills: typeof p.skills === 'string' ? JSON.parse(p.skills) : p.skills
      }));
      setPersonas(parsedData.filter((p: Persona) => isLibrary ? p.is_predefined : !p.is_predefined));
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
  }, [isLibrary]);

  const handleSave = async () => {
    if (!editForm.name) return;

    try {
      const url = editingId 
        ? `http://localhost:3001/personas/${editingId}`
        : 'http://localhost:3001/personas';
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        ...editForm,
        is_predefined: editForm.is_predefined !== undefined ? editForm.is_predefined : isLibrary,
        skills: JSON.stringify(editForm.skills || [])
      };

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      setEditingId(null);
      setIsAdding(false);
      setEditForm({});
      fetchPersonas();
    } catch (err) {
      console.error('Failed to save persona', err);
    }
  };

  const handleTest = async () => {
    if (!testPrompt.trim()) return;
    setIsTesting(true);
    setTestResult('');
    
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch('http://localhost:3001/personas/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: editForm,
          prompt: testPrompt
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setTestResult(prev => prev + data.text);
              }
              if (data.error) {
                setTestResult(prev => prev + `\n[Error: ${data.error}]`);
              }
            } catch (e) {
              // Partial JSON
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Sandbox test failed', err);
        setTestResult(prev => prev + '\n[Test failed]');
      }
    } finally {
      setIsTesting(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
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

  const handleExport = (p: Persona) => {
    const exportData = {
      id: p.id,
      name: p.name,
      role: p.role,
      description: p.description,
      systemPrompt: p.systemPrompt,
      chattiness_limit: p.chattiness_limit,
      role_type: p.role_type,
      temperature: p.temperature,
      top_p: p.top_p,
      max_tokens: p.max_tokens,
      presence_penalty: p.presence_penalty,
      frequency_penalty: p.frequency_penalty,
      icon_id: p.icon_id,
      color_accent: p.color_accent,
      skills: p.skills
    };
    const yamlStr = yaml.dump(exportData);
    const blob = new Blob([yamlStr], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${p.id}.yml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClone = (p: Persona) => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      ...p,
      id: undefined,
      name: `${p.name} (Copy)`,
      is_predefined: false
    });
  };

  const startEdit = (p: Persona) => {
    setEditingId(p.id);
    setEditForm(p);
    setIsAdding(false);
    setTestResult('');
  };

  const startAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setEditForm({
      name: '',
      role: '',
      description: '',
      systemPrompt: '',
      providerId: models[0]?.providerId || null,
      modelId: models[0]?.id || null,
      chattiness_limit: 2,
      role_type: 'researcher',
      is_predefined: isLibrary,
      temperature: null,
      top_p: null,
      max_tokens: null,
      presence_penalty: null,
      frequency_penalty: null,
      icon_id: 'user-circle',
      color_accent: 'slate',
      skills: []
    });
    setTestResult('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsAdding(false);
    setEditForm({});
    handleStopTest();
  };

  const getRoleIcon = (type?: string | null, iconId?: string | null) => {
    if (iconId) {
      const IconComp = getIconById(iconId);
      return <IconComp className="w-5 h-5" />;
    }
    switch (type) {
      case 'auditor': return <Shield className="w-5 h-5" />;
      case 'researcher': return <Zap className="w-5 h-5" />;
      case 'summarizer': return <FileText className="w-5 h-5" />;
      default: return <UserCircle className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{isLibrary ? 'Role Library' : 'Custom Personas'}</h2>
        {!isAdding && !editingId && !isLibrary && (
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
          <h3 className="font-bold text-lg">{editingId ? 'Edit Role' : 'New Role'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-600">Name</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. The Contrarian"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-600">Role/Title</label>
              <input
                type="text"
                value={editForm.role || ''}
                onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                placeholder="e.g. Critical Thinking Expert"
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-zinc-600">Description</label>
            <input
              type="text"
              value={editForm.description || ''}
              onChange={e => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Short summary of what this role does"
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-zinc-600">System Prompt</label>
                <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase">
                  <BookOpen className="w-3 h-3" />
                  Insert Template
                </div>
              </div>
              <textarea
                value={editForm.systemPrompt || ''}
                onChange={e => setEditForm(prev => ({ ...prev, systemPrompt: e.target.value }))}
                placeholder="Instructions for how this persona should behave..."
                rows={4}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none resize-none"
              />
            </div>
            
            <div className="p-4 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <PromptTemplateLibrary onSelect={suffix => setEditForm(prev => ({ ...prev, systemPrompt: (prev.systemPrompt || '') + suffix }))} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 border-y border-zinc-100 dark:border-zinc-800">
            {/* Visual Branding */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Palette className="w-4 h-4" />
                Visual Identity
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600">Persona Icon</label>
                <IconPicker 
                  selectedId={editForm.icon_id || 'user-circle'} 
                  onChange={id => setEditForm(prev => ({ ...prev, icon_id: id }))} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600">Color Accent</label>
                <ColorPicker 
                  selectedId={editForm.color_accent || 'slate'} 
                  onChange={id => setEditForm(prev => ({ ...prev, color_accent: id }))} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600">Skills (comma separated)</label>
                <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2">
                  <Tag className="w-3.5 h-3.5 text-zinc-600" />
                  <input
                    type="text"
                    value={editForm.skills?.join(', ') || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
                    placeholder="e.g. analysis, logic, creative"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Model Parameters */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Sliders className="w-4 h-4" />
                Model Parameters
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 flex justify-between">
                    Temperature <span>{editForm.temperature ?? 'Default'}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={editForm.temperature ?? 1}
                    onChange={e => setEditForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 flex justify-between">
                    Top P <span>{editForm.top_p ?? 'Default'}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={editForm.top_p ?? 1}
                    onChange={e => setEditForm(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600">Max Tokens</label>
                  <input
                    type="number"
                    placeholder="Provider Default"
                    value={editForm.max_tokens || ''}
                    onChange={e => setEditForm(prev => ({ ...prev, max_tokens: e.target.value ? parseInt(e.target.value) : null }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 flex justify-between">
                    Chattiness <span>{editForm.chattiness_limit ?? '2'}</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={editForm.chattiness_limit ?? 2}
                    onChange={e => setEditForm(prev => ({ ...prev, chattiness_limit: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-tighter text-zinc-600 flex justify-between">
                  Presence Penalty <span>{editForm.presence_penalty ?? '0'}</span>
                </label>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.1"
                  value={editForm.presence_penalty ?? 0}
                  onChange={e => setEditForm(prev => ({ ...prev, presence_penalty: parseFloat(e.target.value) }))}
                  className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-zinc-900 dark:accent-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Sandbox Area */}
          <div className="p-6 bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Play className="w-4 h-4 text-emerald-500" />
                Live Persona Sandbox
              </div>
              {isTesting && (
                <button
                  onClick={handleStopTest}
                  className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-rose-500 hover:text-rose-400"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  Stop
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPrompt}
                onChange={e => setTestPrompt(e.target.value)}
                placeholder="Enter a test message to see how this persona responds..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-zinc-500"
                onKeyDown={e => e.key === 'Enter' && handleTest()}
              />
              <button
                onClick={handleTest}
                disabled={isTesting || !testPrompt.trim() || !editForm.modelId}
                className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Test
              </button>
            </div>

            {(testResult || isTesting) && (
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700 text-sm text-zinc-300 min-h-[100px] max-h-[300px] overflow-auto">
                <Markdown content={testResult} variant="assistant" />
                {isTesting && <span className="inline-block w-1.5 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-600">Assigned Model</label>
              <select
                value={`${editForm.providerId}:${editForm.modelId}`}
                onChange={e => {
                  const [providerId, modelId] = e.target.value.split(':');
                  setEditForm(prev => ({ ...prev, providerId, modelId }));
                }}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="null:null">No Model (Template Only)</option>
                {models.map(m => (
                  <option key={`${m.providerId}:${m.id}`} value={`${m.providerId}:${m.id}`}>
                    [{m.providerName}] {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-zinc-600">Role Category</label>
              <select
                value={editForm.role_type || 'auditor'}
                onChange={e => setEditForm(prev => ({ ...prev, role_type: e.target.value }))}
                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm outline-none"
              >
                <option value="researcher">Researcher</option>
                <option value="auditor">Auditor</option>
                <option value="summarizer">Summarizer</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map(p => (
          <div
            key={p.id}
            className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all group border-l-4 ${p.color_accent ? getBorderColorClass(p.color_accent) : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 ${p.color_accent ? getTextColorClass(p.color_accent) : 'text-zinc-600'}`}>
                  {getRoleIcon(p.role_type, p.icon_id)}
                </div>
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    {p.name}
                    {p.role_type && (
                      <span className="text-[9px] font-bold uppercase bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-600">
                        {p.role_type}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider">{p.role}</div>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleExport(p)}
                  title="Export to YAML"
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
                {isLibrary && (
                  <button
                    onClick={() => handleClone(p)}
                    title="Clone to Custom"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => startEdit(p)}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-600 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {!p.is_predefined && (
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-zinc-600 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="mt-3 text-xs text-zinc-600 line-clamp-2 italic">
              {p.description || `"${p.systemPrompt}"`}
            </div>
            
            {p.skills && p.skills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {p.skills.map(s => (
                  <span key={s} className="text-[9px] px-1.5 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-600 uppercase">Assigned Model:</span>
                <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-600">
                  {p.modelId || 'None'}
                </span>
              </div>
              {p.chattiness_limit && (
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase">Chattiness:</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-1.5 h-1.5 rounded-full ${i < (p.chattiness_limit || 0) ? (p.color_accent ? getTextColorClass(p.color_accent).replace('text-', 'bg-') : 'bg-blue-500') : 'bg-zinc-200 dark:bg-zinc-800'}`} 
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
