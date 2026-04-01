'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Upload, Loader2, Database } from 'lucide-react';

interface Document {
  id: string;
  sessionId: string;
  name: string;
  content: string;
  type: string;
  createdAt: string;
}

interface DocumentManagerProps {
  sessionId: string;
}

export default function DocumentManager({ sessionId }: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:3001/api/sessions/${sessionId}/documents`);
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchDocuments();
    }
  }, [sessionId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const content = await file.text();
      const res = await fetch(`http://localhost:3001/api/sessions/${sessionId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: file.name,
          content: content,
          type: file.type || 'text/plain'
        })
      });

      if (res.ok) {
        fetchDocuments();
      }
    } catch (err) {
      console.error('Failed to upload document', err);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:3001/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setDocuments(docs => docs.filter(d => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete document', err);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold uppercase text-zinc-400 flex items-center gap-2 tracking-wider">
          <Database className="w-3.5 h-3.5" />
          Knowledge Base
        </h3>
        <label className="cursor-pointer group">
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={isUploading}
            accept=".txt,.md,.json,.csv"
          />
          <div className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all hover:opacity-90 active:scale-95 disabled:opacity-50">
            {isUploading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Upload className="w-3 h-3" />
            )}
            Add Context
          </div>
        </label>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 opacity-20" />
            <p className="text-[10px] font-bold uppercase tracking-widest">Loading KB...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-900/50">
            <FileText className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-2" />
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-tight">No documents yet</p>
            <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tighter opacity-60 font-medium">Upload text files for session context.</p>
          </div>
        ) : (
          documents.map(doc => (
            <div
              key={doc.id}
              className="group flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-800 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {doc.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">
                    {Math.round(doc.content.length / 1024)} KB • {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
