import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sys from '../lib/system.js';
import * as db from '../lib/database.js';
import { badge, section } from '../lib/display.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const GROUPS_DIR = path.join(PROJECT_ROOT, 'groups');
const SESSIONS_DIR = path.join(PROJECT_ROOT, 'data', 'sessions');

export function run(): void {
  // Service
  section('Service');
  const active = sys.isServiceActive();
  console.log(`    Status:  ${badge(active)}`);
  if (active) {
    console.log(`    Since:   ${sys.getServiceUptime()}`);
  }
  console.log('');

  // Processes
  section('Processes');
  const procs = sys.getNodeProcesses();
  if (procs.length) {
    for (const p of procs) {
      console.log(
        `    PID ${p.pid}  ${pc.green('running')}  uptime: ${p.uptime}  mem: ${p.memMb} MB`,
      );
    }
  } else {
    console.log(`    ${pc.red('No node processes')}`);
  }
  console.log('');

  // Containers
  section('Containers');
  const containers = sys.getContainers();
  if (containers.length) {
    for (const c of containers) {
      console.log(`    ${pc.green(c.name)}  ${c.status}`);
    }
  } else {
    console.log('    No active containers');
  }
  console.log('');

  // Groups
  section('Groups');
  if (fs.existsSync(GROUPS_DIR)) {
    const groups = fs
      .readdirSync(GROUPS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const g of groups) {
      const running = sys.isContainerRunning(g.name);
      const status = running
        ? pc.green('running')
        : pc.dim('idle');
      console.log(`    ${g.name}  [${status}]`);
    }
  }
  console.log('');

  // Sessions
  section('Sessions');
  if (fs.existsSync(SESSIONS_DIR)) {
    const sessions = fs
      .readdirSync(SESSIONS_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory());
    for (const s of sessions) {
      console.log(`    ${s.name}`);
    }
  } else {
    console.log('    No sessions');
  }
  console.log('');

  // Scheduled tasks summary
  section('Scheduled Tasks');
  const tasks = db.getScheduledTasks('active');
  if (tasks.length) {
    for (const t of tasks) {
      const schedule =
        t.schedule_type === 'cron'
          ? `cron: ${t.schedule_value}`
          : `every ${t.schedule_value}`;
      console.log(
        `    ${pc.bold(t.group_folder)}  ${schedule}  ${pc.dim(t.next_run || '')}`,
      );
    }
  } else {
    console.log('    No active tasks');
  }
  console.log('');
}
