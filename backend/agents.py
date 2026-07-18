import os
import json
import re
from pathlib import Path
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from groq import Groq

dotenv_path = Path(__file__).resolve().parent / '.env'
load_dotenv(dotenv_path)
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
MODEL_NAME = 'llama-3.3-70b-versatile'
client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None

COMMITMENT_PROMPT = '''
You are an assistant that extracts only real commitments from a meeting transcript.
Return valid JSON only. Output an array of objects with exactly these keys:
- owner (string)
- task (string)
- deadline (string|null)

Transcript parsed into speaker segments:
{parsed}

Only include clear action items or commitments. Do not include general discussion, greetings, or questions.
'''

EMAIL_PROMPT = '''
You are a friendly assistant that drafts follow-up emails for assigned action items.
Return valid JSON only. Output an object with keys:
- to (string)
- subject (string)
- body (string)

Generate a short, polite email using the owner's name and the following tasks:
{tasks}
'''

VALIDATOR_PROMPT = '''
You are a transcript validation assistant.
Given the original transcript and a JSON array of extracted commitments, return valid JSON only.
Output an object with keys:
- valid (boolean)
- note (string)

If the commitments accurately reflect the commitments in the transcript, return valid true and a concise note.
If something seems missing or hallucinated, return valid false and briefly explain what should be corrected.
'''


def query_groq(prompt: str, max_retries: int = 1) -> Dict[str, Any]:
    if client is None:
        raise RuntimeError('GROQ_API_KEY is not configured. Set GROQ_API_KEY in backend/.env or environment.')

    for attempt in range(max_retries + 1):
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{'role': 'user', 'content': prompt}],
            temperature=0.2,
            top_p=0.95,
            response_format={'type': 'json_object'},
            max_completion_tokens=512,
        )

        if not response.choices:
            continue

        message = response.choices[0].message
        content = getattr(message, 'content', None)
        if not content or not isinstance(content, str):
            continue

        try:
            return json.loads(content.strip())
        except json.JSONDecodeError:
            if attempt == max_retries:
                raise ValueError('Groq response was not valid JSON: ' + repr(content))
    raise RuntimeError('Groq query failed after retries')


def parse_transcript(raw_text: str) -> List[Dict[str, str]]:
    lines = [line.strip() for line in raw_text.splitlines() if line.strip()]
    parsed = []
    speaker_re = re.compile(r'^(?P<speaker>[^:]+):\s*(?P<text>.+)$')
    for line in lines:
        match = speaker_re.match(line)
        if match:
            parsed.append({'speaker': match.group('speaker').strip(), 'text': match.group('text').strip()})
        else:
            if parsed:
                parsed[-1]['text'] += ' ' + line
    return parsed


def extract_commitments(parsed_transcript: List[Dict[str, str]]) -> List[Dict[str, Optional[str]]]:
    formatted = json.dumps(parsed_transcript, ensure_ascii=False)
    prompt = COMMITMENT_PROMPT.format(parsed=formatted)
    commitments = query_groq(prompt)
    if not isinstance(commitments, list):
        raise ValueError('Commitments response was not a JSON array')
    normalized = []
    for item in commitments:
        if not isinstance(item, dict):
            continue
        owner = item.get('owner')
        task = item.get('task')
        deadline = item.get('deadline') if item.get('deadline') is not None else None
        if isinstance(owner, str) and isinstance(task, str):
            normalized.append({'owner': owner.strip(), 'task': task.strip(), 'deadline': deadline.strip() if isinstance(deadline, str) else None})
    return normalized


def format_tasks(commitments: List[Dict[str, Optional[str]]]) -> List[Dict[str, Optional[str]]]:
    tasks = []
    for item in commitments:
        owner = item['owner']
        title = item['task']
        deadline = item.get('deadline')
        priority = 'medium'
        if deadline:
            low_words = ['later', 'longer term']
            if re.search(r'\b(today|tomorrow|by [A-Za-z]+|end of day|eod|this week|next week)\b', deadline, re.I):
                priority = 'high'
            elif any(word in deadline.lower() for word in low_words):
                priority = 'low'
            else:
                priority = 'medium'
        tasks.append({'owner': owner, 'title': title, 'due_date': deadline, 'priority': priority})
    return tasks


def draft_emails(tasks: List[Dict[str, Optional[str]]]) -> List[Dict[str, str]]:
    grouped = {}
    for task in tasks:
        owner = task['owner']
        grouped.setdefault(owner, []).append(task)

    emails = []
    for owner, owner_tasks in grouped.items():
        task_lines = '\n'.join([f"- {task['title']}" + (f" (due {task['due_date']})" if task['due_date'] else '') for task in owner_tasks])
        prompt = EMAIL_PROMPT.format(tasks=task_lines)
        result = query_groq(prompt)
        if not isinstance(result, dict):
            raise ValueError('Email response was not a JSON object')
        to = result.get('to', owner)
        subject = result.get('subject', f'Follow-up on your action items')
        body = result.get('body', f'Hi {owner},\n\nHere are your action items:\n{task_lines}')
        emails.append({'to': to.strip(), 'subject': subject.strip(), 'body': body.strip()})
    return emails


def validate_commitments(original_transcript: str, commitments: List[Dict[str, Optional[str]]]) -> Dict[str, Any]:
    prompt = VALIDATOR_PROMPT.format(parsed=json.dumps(original_transcript, ensure_ascii=False), commitments=json.dumps(commitments, ensure_ascii=False))
    return query_groq(prompt)
