import { select } from '@clack/prompts';
import pc from 'picocolors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as sys from '../lib/system.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');
const GROUPS_DIR = path.join(PROJECT_ROOT, 'groups');

export function list(): void {
  if (!fs.existsSync(GROUPS_DIR)) {
    console.log('  No groups directory');
    return;
  }

  const dirs = fs
    .readdirSync(GROUPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  for (const d of dirs) {
    const running = sys.isContainerRunning(d.name);
    const status = running ? pc.green('running') : pc.dim('idle');
    console.log(`  ${d.name}  [${status}]`);
  }
}

export function view(name: string): void {
  const claudeMd = path.join(GROUPS_DIR, name, 'CLAUDE.md');
  if (!fs.existsSync(claudeMd)) {
    console.log(`  No CLAUDE.md found for group: ${name}`);
    return;
  }
  console.log(pc.bold(`  ${name}/CLAUDE.md`));
  console.log('');
  console.log(fs.readFileSync(claudeMd, 'utf-8'));
}

export async function interactive(): Promise<void> {
  if (!fs.existsSync(GROUPS_DIR)) {
    console.log('  No groups directory');
    return;
  }

  const dirs = fs
    .readdirSync(GROUPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory());

  const choices = dirs.map((d) => {
    const running = sys.isContainerRunning(d.name);
    const status = running ? pc.green('running') : pc.dim('idle');
    return {
      value: d.name,
      label: `${d.name}  [${status}]`,
    };
  });

  choices.push({ value: 'back', label: 'Back' });

  const choice = await select({
    message: 'Select group to view CLAUDE.md',
    options: choices,
  });

  if (typeof choice !== 'string' || choice === 'back') return;
  console.log('');
  view(choice);
}
