import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Meeting-to-Action',
  description: 'Extract tasks and follow-up emails from meeting transcripts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col lg:flex-row">
          <aside className="border-b border-slate-200 bg-white px-6 py-8 shadow-sm lg:border-b-0 lg:border-r lg:w-72">
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-teal-600 text-xl font-bold text-white shadow-sm">
                M2A
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900">Meeting-to-Action</p>
                <p className="text-sm text-slate-500">Transcript → tasks → emails</p>
              </div>
            </div>
            <nav className="space-y-2 text-sm">
              <Link
                href="/"
                className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition hover:bg-teal-50"
              >
                Dashboard
              </Link>
              <Link
                href="/history"
                className="block rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 font-medium text-slate-900 transition hover:bg-teal-50"
              >
                History
              </Link>
            </nav>
            <div className="mt-10 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Live links</p>
              <a href="https://multi-agent-meeting-bot.netlify.app" className="mt-3 block text-teal-700 hover:underline">
                Frontend App
              </a>
              <a href="https://multi-agent-meeting-bot.onrender.com/docs" className="mt-2 block text-teal-700 hover:underline">
                Backend Docs
              </a>
            </div>
          </aside>

          <main className="flex-1 px-6 py-8 lg:px-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
