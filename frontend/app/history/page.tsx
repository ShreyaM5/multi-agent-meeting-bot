'use client';

import { useEffect, useState } from 'react';

type HistoryEntry = {
  id: number;
  timestamp: string;
  summary: string;
};

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  async function fetchHistory() {
    if (!apiUrl) {
      setError('Set NEXT_PUBLIC_API_URL in frontend/.env.local to use history.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/history`);
      if (!response.ok) {
        throw new Error('Unable to load history');
      }
      const data = await response.json();
      setHistory(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <h1 className="text-3xl font-semibold text-slate-900">History</h1>
          <p className="mt-2 text-sm text-slate-600">Browse recent transcript runs stored by the backend.</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={fetchHistory}
              disabled={loading || !apiUrl}
              className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
            >
              {loading ? 'Refreshing…' : 'Refresh history'}
            </button>
            {!apiUrl ? (
              <p className="rounded-full bg-amber-50 px-4 py-3 text-sm text-amber-800">NEXT_PUBLIC_API_URL is not configured.</p>
            ) : null}
          </div>
          {error ? <p className="mt-4 rounded-3xl bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
        </header>

        {history.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-600 shadow-sm">
            <p className="text-lg font-medium">No history available yet.</p>
            <p className="mt-2 text-sm">Process a transcript from the Dashboard page to generate history entries.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {history.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Run {item.id}</p>
                    <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-700">{item.summary}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
