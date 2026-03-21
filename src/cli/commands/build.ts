import { execSync } from 'child_process';
import { spinner } from '@clack/prompts';
import pc from 'picocolors';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..');

export async function typescript(): Promise<void> {
  const s = spinner();
  s.start('Building TypeScript...');
  try {
    execSync('npm run build', {
      cwd: PROJECT_ROOT,
      stdio: 'pipe',
      timeout: 60000,
    });
    s.stop(pc.green('TypeScript build complete'));
  } catch (e) {
    s.stop(pc.red('Build failed'));
    if (e instanceof Error && 'stdout' in e) {
      console.log((e as { stdout: Buffer }).stdout?.toString() || '');
    }
  }
}

export async function container(): Promise<void> {
  console.log('  Building container image...\n');
  try {
    execSync('./container/build.sh', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
      timeout: 300000,
    });
    console.log(pc.green('\n  Container build complete'));
  } catch {
    console.log(pc.red('\n  Container build failed'));
  }
}

export async function all(): Promise<void> {
  await typescript();
  console.log('');
  await container();
}
