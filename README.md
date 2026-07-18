# Meeting-to-Action

A full-stack prototype that turns meeting transcripts into structured tasks and follow-up emails using a multi-agent-inspired pipeline.

## Project structure

- `/backend` — FastAPI backend, Groq LLM integration, SQLite storage
- `/frontend` — Next.js + Tailwind frontend for transcript input and results display

## Environment variables

Backend:
- `backend/.env` should contain:
  - `GROQ_API_KEY=your_groq_api_key_here`

Frontend:
- `frontend/.env.local` contains:
  - `NEXT_PUBLIC_API_URL=http://localhost:8000`

## Run locally

1. Backend

```powershell
cd backend
& 'C:\Users\user\AppData\Local\Microsoft\WindowsApps\python.exe' -m uvicorn backend.main:APP --reload --host 127.0.0.1 --port 8000
```

2. Frontend

```powershell
cd frontend
npm run dev
```

Then open: `http://localhost:3000`

## Backend endpoints

- `POST /process-transcript` — process a transcript and return parsed transcript, commitments, tasks, emails, and validation
- `GET /history` — list past processed transcripts stored in SQLite

## How it works

- `backend/agents.py`: pipeline functions and Groq prompt integration
- `backend/db.py`: SQLite initialization and history storage
- `backend/main.py`: FastAPI app, CORS, request validation
- `frontend/app/page.tsx`: transcript input, loading state, tasks table, email cards with `mailto:` links

## Notes

- This app uses `mailto:` links for follow-up emails only and does not send real emails.
- The backend stores processed transcript runs in `backend/meetings.db`.
