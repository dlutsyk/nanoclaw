import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const DB_PATH = path.join(PROJECT_ROOT, 'store', 'messages.db');

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { readonly: false });
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export interface GroupRow {
  jid: string;
  name: string;
  folder: string;
  trigger_pattern: string;
  is_main: number;
  added_at: string;
}

export interface TaskRow {
  id: string;
  group_folder: string;
  chat_jid: string;
  prompt: string;
  schedule_type: string;
  schedule_value: string;
  next_run: string | null;
  last_run: string | null;
  last_result: string | null;
  status: string;
  created_at: string;
  context_mode: string;
}

export interface TaskRunRow {
  task_id: string;
  group_folder: string;
  run_at: string;
  duration_ms: number;
  status: string;
  result: string | null;
  error: string | null;
}

export interface SessionRow {
  group_folder: string;
  session_id: string;
}

export interface MessageRow {
  id: string;
  chat_jid: string;
  sender: string;
  sender_name: string;
  content: string;
  timestamp: string;
  is_from_me: number;
}

export function getGroups(): GroupRow[] {
  return getDb()
    .prepare(
      'SELECT jid, name, folder, trigger_pattern, is_main, added_at FROM registered_groups ORDER BY is_main DESC, name',
    )
    .all() as GroupRow[];
}

export function getScheduledTasks(status?: string): TaskRow[] {
  if (status) {
    return getDb()
      .prepare(
        'SELECT * FROM scheduled_tasks WHERE status = ? ORDER BY group_folder, next_run',
      )
      .all(status) as TaskRow[];
  }
  return getDb()
    .prepare(
      'SELECT * FROM scheduled_tasks ORDER BY group_folder, status DESC, next_run',
    )
    .all() as TaskRow[];
}

export function getTaskRunHistory(limit = 20): TaskRunRow[] {
  return getDb()
    .prepare(
      `SELECT l.task_id, t.group_folder, l.run_at, l.duration_ms, l.status, l.result, l.error
     FROM task_run_logs l
     JOIN scheduled_tasks t ON t.id = l.task_id
     ORDER BY l.run_at DESC
     LIMIT ?`,
    )
    .all(limit) as TaskRunRow[];
}

export function pauseTask(id: string): number {
  const result = getDb()
    .prepare(
      "UPDATE scheduled_tasks SET status = 'paused' WHERE id = ? AND status = 'active'",
    )
    .run(id);
  return result.changes;
}

export function resumeTask(id: string): number {
  const result = getDb()
    .prepare(
      "UPDATE scheduled_tasks SET status = 'active' WHERE id = ? AND status = 'paused'",
    )
    .run(id);
  return result.changes;
}

export function deleteTask(id: string): number {
  const d = getDb();
  d.prepare('DELETE FROM task_run_logs WHERE task_id = ?').run(id);
  const result = d.prepare('DELETE FROM scheduled_tasks WHERE id = ?').run(id);
  return result.changes;
}

export function getSessions(): SessionRow[] {
  return getDb()
    .prepare('SELECT group_folder, session_id FROM sessions ORDER BY group_folder')
    .all() as SessionRow[];
}

export function getRecentMessages(limit = 20): MessageRow[] {
  return getDb()
    .prepare(
      `SELECT id, chat_jid, sender, sender_name, content, timestamp, is_from_me
     FROM messages ORDER BY timestamp DESC LIMIT ?`,
    )
    .all(limit) as MessageRow[];
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
