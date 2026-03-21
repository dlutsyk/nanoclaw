import { select, confirm } from '@clack/prompts';
import pc from 'picocolors';
import * as db from '../lib/database.js';
import { table, truncate } from '../lib/display.js';

export function list(status?: string): void {
  const tasks = db.getScheduledTasks(status);
  if (!tasks.length) {
    console.log(status ? `  No ${status} tasks` : '  No scheduled tasks');
    return;
  }

  // Group by bot
  const byGroup = new Map<string, typeof tasks>();
  for (const t of tasks) {
    const group = byGroup.get(t.group_folder) || [];
    group.push(t);
    byGroup.set(t.group_folder, group);
  }

  for (const [group, groupTasks] of byGroup) {
    const activeCount = groupTasks.filter((t) => t.status === 'active').length;
    console.log(
      `  ${pc.bold(pc.cyan(group))}  ${pc.green(`${activeCount} active`)} / ${groupTasks.length} total`,
    );
    console.log('');

    for (const t of groupTasks) {
      const statusColor = t.status === 'active' ? pc.green : pc.dim;
      const schedule =
        t.schedule_type === 'cron'
          ? `cron: ${t.schedule_value}`
          : t.schedule_type === 'interval'
            ? `every ${t.schedule_value}`
            : t.schedule_value;

      const nextRun = t.next_run ? new Date(t.next_run).toLocaleString() : '';

      console.log(`    ${statusColor(`[${t.status}]`)} ${pc.bold(schedule)}`);
      console.log(`      ${pc.dim(`next: ${nextRun}`)}`);
      console.log(`      ${truncate(t.prompt, 120)}`);
      console.log(`      ${pc.dim(`id: ${t.id}`)}`);
      console.log('');
    }
  }
}

export function history(limit = 20): void {
  const runs = db.getTaskRunHistory(limit);
  if (!runs.length) {
    console.log('  No task run history');
    return;
  }

  table(
    ['Group', 'Task ID', 'Run At', 'Duration', 'Status', 'Result'],
    runs.map((r) => [
      r.group_folder,
      r.task_id.slice(-12),
      new Date(r.run_at).toLocaleString(),
      `${r.duration_ms}ms`,
      r.status,
      truncate(r.error || r.result || '', 40),
    ]),
  );
}

export function pause(id: string): void {
  const changed = db.pauseTask(id);
  if (changed > 0) {
    console.log(pc.green(`  Task paused: ${id}`));
  } else {
    console.log(pc.yellow('  Task not found or not active'));
  }
}

export function resume(id: string): void {
  const changed = db.resumeTask(id);
  if (changed > 0) {
    console.log(pc.green(`  Task resumed: ${id}`));
  } else {
    console.log(pc.yellow('  Task not found or not paused'));
  }
}

export async function remove(id: string): Promise<void> {
  const ok = await confirm({ message: `Delete task ${id}?` });
  if (ok !== true) return;
  const changed = db.deleteTask(id);
  if (changed > 0) {
    console.log(pc.green('  Task deleted'));
  } else {
    console.log(pc.yellow('  Task not found'));
  }
}

export async function interactive(): Promise<void> {
  list();

  const choice = await select({
    message: 'Task actions',
    options: [
      { value: 'history', label: 'Show run history' },
      { value: 'pause', label: 'Pause a task' },
      { value: 'resume', label: 'Resume a task' },
      { value: 'delete', label: pc.red('Delete a task') },
      { value: 'back', label: 'Back' },
    ],
  });

  if (typeof choice !== 'string' || choice === 'back') return;

  if (choice === 'history') {
    history();
    return;
  }

  // For pause/resume/delete, show task selection
  const tasks = db.getScheduledTasks();
  if (!tasks.length) {
    console.log('  No tasks');
    return;
  }

  const taskChoices = tasks.map((t) => ({
    value: t.id,
    label: `[${t.status}] ${t.group_folder} — ${truncate(t.prompt, 60)}`,
  }));
  taskChoices.push({ value: 'back', label: 'Back' });

  const taskId = await select({
    message: `Select task to ${choice}`,
    options: taskChoices,
  });

  if (typeof taskId !== 'string' || taskId === 'back') return;

  if (choice === 'pause') pause(taskId);
  else if (choice === 'resume') resume(taskId);
  else if (choice === 'delete') await remove(taskId);
}
