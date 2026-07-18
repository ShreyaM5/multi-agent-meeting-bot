import sqlite3
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).resolve().parent / 'meetings.db'

CREATE_TABLE_SQL = '''
CREATE TABLE IF NOT EXISTS meetings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    transcript TEXT NOT NULL,
    tasks_json TEXT NOT NULL,
    emails_json TEXT NOT NULL
);
'''


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.execute(CREATE_TABLE_SQL)
    conn.commit()
    conn.close()


def save_meeting(transcript: str, tasks_json: str, emails_json: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO meetings (timestamp, transcript, tasks_json, emails_json) VALUES (?, ?, ?, ?)',
        (datetime.utcnow().isoformat() + 'Z', transcript, tasks_json, emails_json),
    )
    meeting_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return meeting_id


def list_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, timestamp, substr(transcript, 1, 200) as summary FROM meetings ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    return [{'id': row[0], 'timestamp': row[1], 'summary': row[2]} for row in rows]
