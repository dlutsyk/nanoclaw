import {
  execSync,
  execFileSync,
  spawn,
  type ChildProcess,
} from 'child_process';

function exec(cmd: string): string {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 10000 }).trim();
  } catch {
    return '';
  }
}

export interface ProcessInfo {
  pid: number;
  uptime: string;
  memMb: number;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: string;
  runningFor: string;
}

// ── Service ──

export function isServiceActive(): boolean {
  return exec('sudo systemctl is-active nanoclaw') === 'active';
}

export function getServiceUptime(): string {
  return exec(
    'sudo systemctl show nanoclaw --property=ActiveEnterTimestamp --value',
  );
}

export function startService(): boolean {
  try {
    execSync('sudo systemctl start nanoclaw', { timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

export function stopService(): boolean {
  try {
    execSync('sudo systemctl stop nanoclaw', { timeout: 15000 });
    return true;
  } catch {
    return false;
  }
}

// ── Processes ──

export function getNodeProcesses(): ProcessInfo[] {
  const pids = exec('pgrep -f "node.*dist/index.js"');
  if (!pids) return [];

  return pids.split('\n').map((pidStr) => {
    const pid = parseInt(pidStr, 10);
    const uptime = exec(`ps -o etime= -p ${pid}`).trim();
    const rss = parseInt(exec(`ps -o rss= -p ${pid}`), 10) || 0;
    return { pid, uptime, memMb: Math.round(rss / 1024) };
  });
}

// ── Containers ──

export function getContainers(all = false): ContainerInfo[] {
  const flag = all ? '-a' : '';
  const raw = exec(
    `docker ps ${flag} --format "{{.ID}}\\t{{.Names}}\\t{{.Status}}\\t{{.RunningFor}}"`,
  );
  if (!raw) return [];

  return raw.split('\n').map((line) => {
    const [id, name, status, runningFor] = line.split('\t');
    return { id, name, status, runningFor };
  });
}

export function isContainerRunning(nameFragment: string): boolean {
  const containers = getContainers();
  return containers.some((c) => c.name.includes(nameFragment));
}

export function killContainer(nameOrId: string): boolean {
  try {
    execFileSync('docker', ['kill', nameOrId], { timeout: 10000 });
    return true;
  } catch {
    return false;
  }
}

export function killAllContainers(): number {
  const ids = exec('docker ps -q --filter "name=nanoclaw"');
  if (!ids) return 0;
  const list = ids.split('\n');
  for (const id of list) {
    try {
      execFileSync('docker', ['kill', id], { timeout: 10000 });
    } catch {}
  }
  return list.length;
}

export function streamContainerLogs(name: string): ChildProcess {
  return spawn('docker', ['logs', '-f', name], { stdio: 'inherit' });
}

// ── Logs ──

export function getServiceLogs(lines: number): string {
  return exec(`sudo journalctl -u nanoclaw --no-pager -n ${lines}`);
}

export function streamServiceLogs(): ChildProcess {
  return spawn('sudo', ['journalctl', '-u', 'nanoclaw', '-f', '--no-pager'], {
    stdio: 'inherit',
  });
}

// ── Session cache ──

export function clearSessionCache(sessionsDir: string): void {
  try {
    execSync(`rm -rf ${sessionsDir}/*/agent-runner-src`, { timeout: 5000 });
    execSync(
      `rm -f ${sessionsDir}/*/.claude/projects/-workspace-group/*.jsonl`,
      { timeout: 5000 },
    );
  } catch {}
}
