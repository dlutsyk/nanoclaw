import { execSync } from 'child_process';
import { select } from '@clack/prompts';
import * as sys from '../lib/system.js';

export function show(lines: number): void {
  console.log(sys.getServiceLogs(lines));
}

export function follow(): void {
  console.log('  Press Ctrl+C to exit\n');
  const child = sys.streamServiceLogs();
  process.on('SIGINT', () => {
    child.kill();
    process.exit(0);
  });
}

export function containerLogs(name: string, doFollow: boolean): void {
  if (doFollow) {
    console.log('  Press Ctrl+C to exit\n');
    const child = sys.streamContainerLogs(name);
    process.on('SIGINT', () => {
      child.kill();
      process.exit(0);
    });
  } else {
    try {
      const output = execSync(`docker logs --tail 100 ${name}`, {
        encoding: 'utf-8',
        timeout: 10000,
      });
      console.log(output);
    } catch {
      console.log('  Failed to get container logs');
    }
  }
}

export async function interactive(): Promise<void> {
  const containers = sys.getContainers();

  const choices: Array<{ value: string; label: string }> = [
    { value: 'follow', label: 'Service log (follow)' },
    { value: 'tail', label: 'Service log (last 50 lines)' },
  ];

  for (const c of containers) {
    choices.push({
      value: `container:${c.name}`,
      label: `Container: ${c.name}`,
    });
  }

  choices.push({ value: 'back', label: 'Back' });

  const choice = await select({
    message: 'Select log source',
    options: choices,
  });

  if (typeof choice !== 'string' || choice === 'back') return;

  if (choice === 'follow') {
    follow();
  } else if (choice === 'tail') {
    show(50);
  } else if (choice.startsWith('container:')) {
    const name = choice.replace('container:', '');
    console.log('  Press Ctrl+C to exit\n');
    const child = sys.streamContainerLogs(name);
    process.on('SIGINT', () => {
      child.kill();
      process.exit(0);
    });
  }
}
