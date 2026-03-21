import pc from 'picocolors';
import * as database from '../lib/database.js';
import { table, truncate } from '../lib/display.js';

export function groups(): void {
  const rows = database.getGroups();
  if (!rows.length) {
    console.log('  No registered groups');
    return;
  }

  table(
    ['Name', 'Folder', 'Trigger', 'Main'],
    rows.map((r) => [
      r.name,
      r.folder,
      r.trigger_pattern,
      r.is_main ? pc.green('yes') : 'no',
    ]),
  );
}

export function messages(limit = 20): void {
  const rows = database.getRecentMessages(limit);
  if (!rows.length) {
    console.log('  No messages');
    return;
  }

  table(
    ['Time', 'Sender', 'Content'],
    rows.map((r) => [
      new Date(parseInt(r.timestamp)).toLocaleString(),
      r.sender_name || r.sender,
      truncate(r.content, 70),
    ]),
  );
}

export function sessions(): void {
  const rows = database.getSessions();
  if (!rows.length) {
    console.log('  No sessions');
    return;
  }

  table(
    ['Group', 'Session ID'],
    rows.map((r) => [r.group_folder, r.session_id]),
  );
}

export function tasks(): void {
  const rows = database.getScheduledTasks();
  if (!rows.length) {
    console.log('  No tasks');
    return;
  }

  table(
    ['ID', 'Group', 'Type', 'Schedule', 'Status', 'Next Run'],
    rows.map((r) => [
      r.id.slice(-12),
      r.group_folder,
      r.schedule_type,
      r.schedule_value,
      r.status,
      r.next_run ? new Date(r.next_run).toLocaleString() : '',
    ]),
  );
}
