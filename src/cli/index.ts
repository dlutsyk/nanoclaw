#!/usr/bin/env node

import { Command } from 'commander';
import { closeDb } from './lib/database.js';

const program = new Command();

program
  .name('nclaw')
  .description('NanoClaw management CLI')
  .version('1.0.0');

// ── status ──
program
  .command('status')
  .description('Show service, process, and container status')
  .action(async () => {
    const { run } = await import('./commands/status.js');
    run();
  });

// ── start / stop / restart ──
program
  .command('start')
  .description('Start the NanoClaw service')
  .action(async () => {
    const { start } = await import('./commands/service.js');
    await start();
  });

program
  .command('stop')
  .description('Stop the service and kill containers')
  .action(async () => {
    const { stop } = await import('./commands/service.js');
    await stop();
  });

program
  .command('restart')
  .description('Full restart with cache cleanup')
  .action(async () => {
    const { restart } = await import('./commands/service.js');
    await restart();
  });

// ── logs ──
const logsCmd = program
  .command('logs')
  .description('View service and container logs');

logsCmd
  .command('tail')
  .description('Show last N lines')
  .option('-n, --lines <number>', 'number of lines', '50')
  .action(async (opts) => {
    const { show } = await import('./commands/logs.js');
    show(parseInt(opts.lines, 10));
  });

logsCmd
  .command('follow')
  .alias('f')
  .description('Follow service logs')
  .action(async () => {
    const { follow } = await import('./commands/logs.js');
    follow();
  });

logsCmd
  .command('container <name>')
  .description('View container logs')
  .option('-f, --follow', 'follow log output')
  .action(async (name, opts) => {
    const { containerLogs } = await import('./commands/logs.js');
    containerLogs(name, opts.follow || false);
  });

// ── containers ──
const containersCmd = program
  .command('containers')
  .description('Manage Docker containers');

containersCmd
  .command('list')
  .alias('ls')
  .description('List containers')
  .option('-a, --all', 'show stopped containers too')
  .action(async (opts) => {
    const { list } = await import('./commands/containers.js');
    list(opts.all || false);
  });

containersCmd
  .command('kill <name>')
  .description('Kill a container')
  .action(async (name) => {
    const { kill } = await import('./commands/containers.js');
    kill(name);
  });

containersCmd
  .command('kill-all')
  .description('Kill all NanoClaw containers')
  .action(async () => {
    const { killAll } = await import('./commands/containers.js');
    await killAll();
  });

// ── groups ──
const groupsCmd = program
  .command('groups')
  .description('View group configs');

groupsCmd
  .command('list')
  .alias('ls')
  .description('List groups')
  .action(async () => {
    const { list } = await import('./commands/groups.js');
    list();
  });

groupsCmd
  .command('view <name>')
  .description('View group CLAUDE.md')
  .action(async (name) => {
    const { view } = await import('./commands/groups.js');
    view(name);
  });

// ── tasks ──
const tasksCmd = program
  .command('tasks')
  .description('Manage scheduled tasks');

tasksCmd
  .command('list')
  .alias('ls')
  .description('List scheduled tasks')
  .option('-s, --status <status>', 'filter by status (active, paused)')
  .action(async (opts) => {
    const { list } = await import('./commands/tasks.js');
    list(opts.status);
  });

tasksCmd
  .command('history')
  .description('Show task run history')
  .option('-n, --limit <number>', 'number of entries', '20')
  .action(async (opts) => {
    const { history } = await import('./commands/tasks.js');
    history(parseInt(opts.limit, 10));
  });

tasksCmd
  .command('pause <id>')
  .description('Pause a task')
  .action(async (id) => {
    const { pause } = await import('./commands/tasks.js');
    pause(id);
  });

tasksCmd
  .command('resume <id>')
  .description('Resume a paused task')
  .action(async (id) => {
    const { resume } = await import('./commands/tasks.js');
    resume(id);
  });

tasksCmd
  .command('delete <id>')
  .description('Delete a task')
  .action(async (id) => {
    const { remove } = await import('./commands/tasks.js');
    await remove(id);
  });

// ── build ──
const buildCmd = program
  .command('build')
  .description('Build TypeScript or container image');

buildCmd
  .command('ts')
  .description('Build TypeScript')
  .action(async () => {
    const { typescript } = await import('./commands/build.js');
    await typescript();
  });

buildCmd
  .command('container')
  .description('Rebuild container image')
  .action(async () => {
    const { container } = await import('./commands/build.js');
    await container();
  });

buildCmd
  .command('all')
  .description('Build everything')
  .action(async () => {
    const { all } = await import('./commands/build.js');
    await all();
  });

// ── db ──
const dbCommand = program
  .command('db')
  .description('Query the database');

dbCommand
  .command('groups')
  .description('Show registered groups')
  .action(async () => {
    const { groups } = await import('./commands/db.js');
    groups();
  });

dbCommand
  .command('messages')
  .description('Show recent messages')
  .option('-n, --limit <number>', 'number of messages', '20')
  .action(async (opts) => {
    const { messages } = await import('./commands/db.js');
    messages(parseInt(opts.limit, 10));
  });

dbCommand
  .command('tasks')
  .description('Show scheduled tasks table')
  .action(async () => {
    const { tasks } = await import('./commands/db.js');
    tasks();
  });

dbCommand
  .command('sessions')
  .description('Show active sessions')
  .action(async () => {
    const { sessions } = await import('./commands/db.js');
    sessions();
  });

// ── default: interactive mode ──
program.action(async () => {
  const { run } = await import('./interactive.js');
  await run();
});

// Cleanup on exit
process.on('exit', () => closeDb());

program.parse();
