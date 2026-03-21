import { select, confirm } from '@clack/prompts';
import pc from 'picocolors';
import * as sys from '../lib/system.js';

export function list(all = false): void {
  const containers = sys.getContainers(all);
  if (!containers.length) {
    console.log(all ? '  No containers' : '  No active containers');
    return;
  }
  for (const c of containers) {
    console.log(`  ${pc.green(c.name)}  ${c.status}  ${pc.dim(c.runningFor)}`);
  }
}

export function kill(nameOrId: string): void {
  if (sys.killContainer(nameOrId)) {
    console.log(pc.green(`  Killed ${nameOrId}`));
  } else {
    console.log(pc.red(`  Container not found: ${nameOrId}`));
  }
}

export async function killAll(): Promise<void> {
  const ok = await confirm({ message: 'Kill all NanoClaw containers?' });
  if (ok !== true) return;
  const count = sys.killAllContainers();
  console.log(
    count > 0
      ? pc.green(`  Killed ${count} container(s)`)
      : '  No containers to kill',
  );
}

export async function interactive(): Promise<void> {
  const containers = sys.getContainers();

  const choices: Array<{ value: string; label: string }> = [];

  if (containers.length) {
    for (const c of containers) {
      choices.push({
        value: `logs:${c.name}`,
        label: `Logs: ${c.name}  ${pc.dim(c.status)}`,
      });
    }
    choices.push({ value: 'kill-all', label: pc.red('Kill all containers') });
  } else {
    console.log('  No active containers');
  }

  choices.push({ value: 'all', label: 'Show stopped containers' });
  choices.push({ value: 'back', label: 'Back' });

  const choice = await select({
    message: 'Container actions',
    options: choices,
  });

  if (typeof choice !== 'string' || choice === 'back') return;

  if (choice === 'all') {
    list(true);
  } else if (choice === 'kill-all') {
    await killAll();
  } else if (choice.startsWith('logs:')) {
    const name = choice.replace('logs:', '');
    console.log('  Press Ctrl+C to exit\n');
    const child = sys.streamContainerLogs(name);
    process.on('SIGINT', () => {
      child.kill();
      process.exit(0);
    });
  }
}
