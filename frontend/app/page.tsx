'use client';

import { useEffect, useState } from 'react';

type Task = {
  owner: string;
  title: string;
  due_date: string | null;
  priority: 'low' | 'medium' | 'high';
};

type Email = {
  to: string;
  subject: string;
  body: string;
};

type HistoryEntry = {
  id: number;
  timestamp: string;
  summary: string;
};

const defaultSampleTranscript = `Alice: Let's begin the status update. I will send the budget deck by Friday.
Bob: That sounds good. I can follow up with legal about the contract language and report back by Monday.
Charlie: We should also document the key risks and share a draft with the team next week.
Alice: Perfect, let's make sure we have the final summary ready by end of day on Thursday.`;

const priorityStyles: Record<string, string> = {
  low: 'bg-emerald-100 text-emerald-800',
  medium: 'bg-amber-100 text-amber-800',
  high: 'bg-red-100 text-red-800',
};

export default function HomePage() {
  const [transcript, setTranscript] = useState(defaultSampleTranscript);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  async function fetchHistory() {
    if (!apiUrl) {
      return;
    }
    setHistoryLoading(true);
    try {
      const response = await fetch(`${apiUrl}/history`);
      if (!response.ok) {
        throw new Error('Unable to load history');
      }
      const data = await response.json();
      setHistory(data || []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit() {
    setError('');
    setTasks([]);
    setEmails([]);
    if (!transcript.trim()) {
      setError('Please paste a transcript before processing.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/process-transcript`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Backend error');
      }
      const data = await response.json();
      setTasks(data.tasks || []);
      setEmails(data.emails || []);
      await fetchHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const encodeMailto = (subject: string, body: string) => {
    const params = new URLSearchParams({ subject, body });
    return `mailto:?${params.toString()}`;
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl bg-white p-10 shadow-lg">
          <h1 className="text-4xl font-semibold text-slate-900">Meeting-to-Action</h1>
          <p className="mt-3 text-slate-600">Paste a meeting transcript and automatically extract commitments, tasks, and follow-up emails.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Transcript input</h2>
            <textarea
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Paste the meeting transcript here..."
              className="mt-4 h-72 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-slate-400"
            />
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="mt-4 inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? 'Processing…' : 'Process Transcript'}
            </button>
            {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">History</h2>
                <p className="mt-3 text-slate-600">Review the most recent transcript runs saved by the backend.</p>
              </div>
              <button
                type="button"
                onClick={fetchHistory}
                disabled={historyLoading || !apiUrl}
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {historyLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>
            <div className="mt-6 space-y-4">
              {apiUrl ? null : (
                <p className="rounded-2xl bg-amber-50 p-4 text-amber-800">Set NEXT_PUBLIC_API_URL in frontend/.env.local to use history.</p>
              )}
              {history.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-4 text-slate-700">No history available yet. Process a transcript to create history.</p>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => (
                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">Run {item.id}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(item.timestamp).toLocaleString()}</p>
                      <p className="mt-2 text-sm text-slate-700">{item.summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {tasks.length > 0 ? (
          <section className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Tasks</h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="text-slate-500">
                    <th className="pb-3 pr-6">Owner</th>
                    <th className="pb-3 pr-6">Task</th>
                    <th className="pb-3 pr-6">Due Date</th>
                    <th className="pb-3 pr-6">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-slate-50' : ''}>
                      <td className="py-4 pr-6 font-medium text-slate-900">{task.owner}</td>
                      <td className="py-4 pr-6 text-slate-700">{task.title}</td>
                      <td className="py-4 pr-6 text-slate-600">{task.due_date || 'No deadline'}</td>
                      <td className="py-4 pr-6">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${priorityStyles[task.priority]}`}>
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {emails.length > 0 ? (
          <section className="mt-10 rounded-3xl bg-white p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-900">Draft Emails</h2>
            <div className="mt-6 grid gap-6">
              {emails.map((email, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{email.to}</h3>
                  <p className="mt-2 text-sm text-slate-600"><strong>Subject:</strong> {email.subject}</p>
                  <pre className="mt-4 whitespace-pre-wrap rounded-3xl bg-white p-4 text-sm leading-6 text-slate-800">{email.body}</pre>
                  <a
                    href={encodeMailto(email.subject, email.body)}
                    className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                  >
                    Open in Email
                  </a>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
