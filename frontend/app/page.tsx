'use client';

import { useRef, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestIdRef = useRef(0);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  async function handleSubmit() {
    setError('');
    setTasks([]);
    setEmails([]);
    if (!transcript.trim()) {
      setError('Please paste a transcript before processing.');
      return;
    }

    requestIdRef.current += 1;
    const currentRequestId = requestIdRef.current;

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
      if (currentRequestId !== requestIdRef.current) {
        return;
      }
      setTasks(data.tasks || []);
      setEmails(data.emails || []);
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  const encodeMailto = (subject: string, body: string) => {
    const params = new URLSearchParams({ subject, body });
    return `mailto:?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-full border border-slate-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-600 text-lg font-bold text-white shadow-sm">
                M2A
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">Meeting-to-Action</p>
                <p className="text-sm text-slate-500">Extract commitments, tasks, and follow-up emails from meeting transcripts.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <a href="https://multi-agent-meeting-bot.netlify.app" className="font-semibold text-teal-700 hover:text-teal-900">Live app</a>
              <span className="h-4 w-px bg-slate-200" />
              <a href="https://multi-agent-meeting-bot.onrender.com/docs" className="font-semibold text-teal-700 hover:text-teal-900">Backend API docs</a>
            </div>
          </div>
        </header>

        <div className="mb-10 overflow-hidden rounded-[2rem] bg-gradient-to-r from-teal-600 via-sky-600 to-cyan-500 p-1 shadow-2xl">
          <div className="rounded-[1.75rem] bg-white px-8 py-10 sm:px-14">
            <h1 className="text-5xl font-semibold tracking-tight text-slate-900">Meeting-to-Action</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">Paste a meeting transcript and automatically extract commitments, tasks, and follow-up emails.</p>
          </div>
        </div>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Transcript input</h2>
          <p className="mt-2 text-sm text-slate-600">Paste the meeting transcript below, then process it to generate action items and follow-up emails.</p>
          <textarea
            value={transcript}
            onChange={(event) => {
              setTranscript(event.target.value);
              setTasks([]);
              setEmails([]);
              setError('');
            }}
            placeholder="Paste the meeting transcript here..."
            className="mt-4 h-72 w-full rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 text-slate-900 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 inline-flex items-center justify-center rounded-full bg-teal-600 px-7 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing…
              </>
            ) : (
              'Process Transcript'
            )}
          </button>
          {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
          {loading ? <p className="mt-4 rounded-3xl bg-teal-50 p-4 text-sm text-teal-800">Processing transcript, please wait...</p> : null}
        </section>

        {(tasks.length > 0 || emails.length > 0) && (
          <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Results</h2>
                <p className="mt-2 text-slate-600">Review the extracted tasks and email drafts generated from your transcript.</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-teal-50 px-3 py-1 text-teal-700">{tasks.length} task{tasks.length === 1 ? '' : 's'}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{emails.length} email draft{emails.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            {tasks.length > 0 && (
              <section className="mt-8">
                <h3 className="text-xl font-semibold text-slate-900">Tasks</h3>
                <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-slate-200">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-4">Owner</th>
                        <th className="px-6 py-4">Task</th>
                        <th className="px-6 py-4">Due Date</th>
                        <th className="px-6 py-4">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.map((task) => (
                        <tr key={`${task.owner}-${task.title}-${task.due_date || 'none'}-${task.priority}`} className="even:bg-slate-50">
                          <td className="whitespace-nowrap px-6 py-4 font-medium text-slate-900">{task.owner}</td>
                          <td className="px-6 py-4 text-slate-700">{task.title}</td>
                          <td className="px-6 py-4 text-slate-600">{task.due_date || 'No deadline'}</td>
                          <td className="px-6 py-4">
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
            )}

            {emails.length > 0 && (
              <section className="mt-10">
                <h3 className="text-xl font-semibold text-slate-900">Draft Emails</h3>
                <div className="mt-6 grid gap-6 lg:grid-cols-2">
                  {emails.map((email) => (
                    <div key={`${email.to}-${email.subject}-${email.body.slice(0, 80)}`} className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-teal-700">{email.to}</p>
                      <p className="text-lg font-semibold text-slate-900">{email.subject}</p>
                      <div className="rounded-3xl bg-white p-4 text-sm leading-7 text-slate-700 shadow-sm">{email.body}</div>
                      <a
                        href={encodeMailto(email.subject, email.body)}
                        className="inline-flex rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                      >
                        Open in Email
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
        <footer className="mt-10 rounded-[1.75rem] border border-slate-200 bg-slate-100 p-6 text-center text-sm text-slate-600 shadow-sm">
          © {new Date().getFullYear()} Meeting-to-Action. All rights reserved. Made by Shreya Maurya.
        </footer>
      </div>
    </main>
  );
}
