# Meeting-to-Action

A multi-agent AI pipeline that turns raw meeting transcripts into structured tasks and ready-to-send follow-up emails.

## Project info

- **Name**: Meeting-to-Action
- **Tagline**: A multi-agent AI pipeline that turns raw meeting transcripts into structured tasks and ready-to-send follow-up emails.
- **Built for**: FlowZint AI Hackathon 2026 (Open Innovation track)

## Live links

- **Live app**: https://multi-agent-meeting-bot.netlify.app
- **Backend API docs**: https://multi-agent-meeting-bot.onrender.com/docs

> Note: The backend is hosted on Render's free tier, so it may take 30–50 seconds to wake up after a period of inactivity.

## What it does

Meeting-to-Action ingests a meeting transcript and automatically converts spoken commitments into task cards and follow-up emails.

1. User pastes a meeting transcript into the frontend.
2. The parser agent cleans the raw text and structures it by speaker.
3. The commitment extractor agent identifies who committed to what and any deadline using the Groq LLM API.
4. The task formatter agent normalizes commitments into structured tasks with inferred priority.
5. The email drafter agent writes a short follow-up email per person and renders it as a `mailto:` link.

## Tech stack

- Frontend: Next.js + Tailwind CSS, deployed on Netlify
- Backend: Python + FastAPI, deployed on Render
- LLM: Groq API (Llama 3.3 70B)
- Storage: SQLite
- Email: `mailto:` links only, no email API/OAuth used

## Project structure

- `/backend` — FastAPI API, Groq integration, SQLite persistence
- `/frontend` — Next.js App Router frontend with Tailwind UI

Key backend files:

- `backend/agents.py` — multi-stage transcript pipeline and Groq prompts
- `backend/db.py` — SQLite initialization and history storage
- `backend/main.py` — FastAPI app, CORS configuration, and API routes

## Running locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- Free Groq API key from https://console.groq.com

### Backend

1. Create `backend/.env` with:
   - `GROQ_API_KEY=your_groq_api_key_here`
2. Install dependencies:

```powershell
cd backend
python -m pip install -r requirements.txt
```

3. Start the API:

```powershell
cd backend
uvicorn main:APP --reload --host 127.0.0.1 --port 8000
```

### Frontend

1. Create `frontend/.env.local` with:
   - `NEXT_PUBLIC_API_URL=http://localhost:8000`
2. Install dependencies:

```powershell
cd frontend
npm install
```

3. Start the frontend:

```powershell
cd frontend
npm run dev
```

4. Open `http://localhost:3000`

## API endpoints

- `POST /process-transcript` — process a transcript and return parsed data, commitments, tasks, and email drafts
- `GET /history` — list past processed transcripts from SQLite
- `GET /health` — health check endpoint

## Notes / limitations

- This is a hackathon prototype and not production-grade.
- Emails are drafted only and never sent automatically; the UI generates `mailto:` links to open the user's email client.
- SQLite storage on Render's free tier is ephemeral and may reset on redeploy or restart.
- The backend may take up to a minute to respond on the first request after inactivity due to Render free tier cold starts.
- The backend stores processed transcript runs in `backend/meetings.db`.
