import { spinner } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sys from '../lib/system.js';
import { badge } from '../lib/display.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const SESSIONS_DIR = path.join(PROJECT_ROOT, 'data', 'sessions');

export async function start(): Promise<void> {
  if (sys.isServiceActive()) {
    console.log(`  Service is already ${badge(true)}`);
    return;
  }

  const s = spinner();
  s.start('Starting NanoClaw...');
  const ok = sys.startService();

  // Wait a moment for process to come up
  await new Promise((r) => setTimeout(r, 2000));

  if (ok && sys.isServiceActive()) {
    s.stop('NanoClaw started');
  } else {
    s.stop(pc.red('Failed to start'));
    console.log('');
    console.log(sys.getServiceLogs(10));
  }
}

export async function stop(): Promise<void> {
  if (!sys.isServiceActive()) {
    console.log(`  Service is already ${badge(false)}`);
    return;
  }

  const s = spinner();
  s.start('Stopping NanoClaw...');
  sys.stopService();
  const killed = sys.killAllContainers();
  s.stop(`Stopped${killed > 0 ? `, killed ${killed} container(s)` : ''}`);
}

export async function restart(): Promise<void> {
  const s = spinner();

  s.start('Stopping service...');
  sys.stopService();
  s.stop('Service stopped');

  const killed = sys.killAllContainers();
  if (killed > 0) {
    console.log(`  Killed ${killed} container(s)`);
  }

  s.start('Clearing session cache...');
  sys.clearSessionCache(SESSIONS_DIR);
  s.stop('Cache cleared');

  s.start('Starting service...');
  sys.startService();
  await new Promise((r) => setTimeout(r, 3000));

  if (sys.isServiceActive()) {
    s.stop(pc.green('Restarted successfully'));
    console.log('');
    console.log(sys.getServiceLogs(5));
  } else {
    s.stop(pc.red('Failed to restart'));
    console.log('');
    console.log(sys.getServiceLogs(10));
  }
}
