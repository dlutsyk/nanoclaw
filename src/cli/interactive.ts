import { intro, outro, select } from '@clack/prompts';
import pc from 'picocolors';
import * as sys from './lib/system.js';
import * as statusCmd from './commands/status.js';
import * as serviceCmd from './commands/service.js';
import * as logsCmd from './commands/logs.js';
import * as containersCmd from './commands/containers.js';
import * as groupsCmd from './commands/groups.js';
import * as tasksCmd from './commands/tasks.js';
import * as buildCmd from './commands/build.js';
import * as dbCmd from './commands/db.js';

function quickStatus(): string {
  const active = sys.isServiceActive();
  const procs = sys.getNodeProcesses();
  const containers = sys.getContainers();

  const parts: string[] = [];

  if (active) {
    const pid = procs[0];
    parts.push(pc.green('● active'));
    if (pid) parts.push(`PID: ${pid.pid}`);
    if (pid) parts.push(`uptime: ${pid.uptime}`);
  } else {
    parts.push(pc.red('○ inactive'));
  }

  parts.push(`containers: ${containers.length}`);

  return parts.join('  ');
}

export async function run(): Promise<void> {
  intro(pc.bold('NanoClaw CLI'));

  while (true) {
    console.log(`  ${quickStatus()}\n`);

    const choice = await select({
      message: 'What do you want to do?',
      options: [
        { value: 'status', label: 'Status', hint: 'full system overview' },
        { value: 'start', label: 'Start' },
        { value: 'stop', label: 'Stop' },
        { value: 'restart', label: 'Restart', hint: 'with cache cleanup' },
        { value: 'logs', label: 'Logs', hint: 'service & container logs' },
        { value: 'containers', label: 'Containers', hint: 'list, logs, kill' },
        { value: 'groups', label: 'Groups', hint: 'view CLAUDE.md' },
        { value: 'tasks', label: 'Tasks', hint: 'scheduled tasks' },
        { value: 'build', label: 'Build', hint: 'TypeScript / container' },
        { value: 'db', label: 'Database', hint: 'query tables' },
        { value: 'quit', label: 'Quit' },
      ],
    });

    if (typeof choice !== 'string' || choice === 'quit') {
      outro('Bye!');
      return;
    }

    console.log('');

    switch (choice) {
      case 'status':
        statusCmd.run();
        break;
      case 'start':
        await serviceCmd.start();
        break;
      case 'stop':
        await serviceCmd.stop();
        break;
      case 'restart':
        await serviceCmd.restart();
        break;
      case 'logs':
        await logsCmd.interactive();
        break;
      case 'containers':
        await containersCmd.interactive();
        break;
      case 'groups':
        await groupsCmd.interactive();
        break;
      case 'tasks':
        await tasksCmd.interactive();
        break;
      case 'build': {
        const buildChoice = await select({
          message: 'What to build?',
          options: [
            { value: 'ts', label: 'TypeScript' },
            { value: 'container', label: 'Container image' },
            { value: 'all', label: 'All' },
            { value: 'back', label: 'Back' },
          ],
        });
        if (buildChoice === 'ts') await buildCmd.typescript();
        else if (buildChoice === 'container') await buildCmd.container();
        else if (buildChoice === 'all') await buildCmd.all();
        break;
      }
      case 'db': {
        const dbChoice = await select({
          message: 'Query what?',
          options: [
            { value: 'groups', label: 'Registered groups' },
            { value: 'messages', label: 'Recent messages' },
            { value: 'tasks', label: 'Scheduled tasks' },
            { value: 'sessions', label: 'Sessions' },
            { value: 'back', label: 'Back' },
          ],
        });
        console.log('');
        if (dbChoice === 'groups') dbCmd.groups();
        else if (dbChoice === 'messages') dbCmd.messages();
        else if (dbChoice === 'tasks') dbCmd.tasks();
        else if (dbChoice === 'sessions') dbCmd.sessions();
        break;
      }
    }

    console.log('');
  }
}
