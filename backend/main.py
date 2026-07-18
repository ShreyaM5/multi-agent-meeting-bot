import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import init_db, save_meeting, list_history
from agents import parse_transcript, extract_commitments, format_tasks, draft_emails, validate_commitments

APP = FastAPI(title='Meeting-to-Action API')
APP.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

class TranscriptRequest(BaseModel):
    transcript: str

class HistoryItem(BaseModel):
    id: int
    timestamp: str
    summary: str

@APP.on_event('startup')
async def startup_event():
    init_db()

@APP.get('/health')
def health_check():
    return {'status': 'ok'}

@APP.get('/history')
def get_history():
    return list_history()

@APP.post('/process-transcript')
def process_transcript(request: TranscriptRequest):
    if not request.transcript.strip():
        raise HTTPException(status_code=400, detail='Transcript cannot be empty')

    parsed = parse_transcript(request.transcript)
    commitments = extract_commitments(parsed)
    tasks = format_tasks(commitments)
    emails = draft_emails(tasks)
    validation = validate_commitments(request.transcript, commitments)

    tasks_json = json.dumps(tasks, ensure_ascii=False)
    emails_json = json.dumps(emails, ensure_ascii=False)
    save_meeting(request.transcript, tasks_json, emails_json)

    return {
        'parsed_transcript': parsed,
        'commitments': commitments,
        'tasks': tasks,
        'emails': emails,
        'validation': validation,
    }
