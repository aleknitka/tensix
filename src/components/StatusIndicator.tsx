'use client';

import { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatusIndicator() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [data, setData] = useState<{ version: string } | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('http://localhost:3001/status');
        if (res.ok) {
          const json = await res.json();
          setData(json);
          setStatus('ok');
        } else {
          setStatus('error');
        }
      } catch (err) {
        setStatus('error');
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
      {status === 'loading' && (
        <Activity className="w-3 h-3 text-zinc-400 animate-pulse" />
      )}
      {status === 'ok' && (
        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      )}
      {status === 'error' && (
        <AlertCircle className="w-3 h-3 text-rose-500" />
      )}
      <span className="text-zinc-500 dark:text-zinc-400">
        Backend {status === 'ok' ? `v${data?.version}` : status}
      </span>
    </div>
  );
}
