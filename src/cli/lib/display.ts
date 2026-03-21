import pc from 'picocolors';

export function header(): void {
  console.log('');
  console.log(pc.bold('  NanoClaw CLI'));
  console.log(pc.dim('  ─────────────────'));
  console.log('');
}

export function badge(active: boolean): string {
  return active ? pc.green('● active') : pc.red('○ inactive');
}

export function statusText(
  text: string,
  status: 'ok' | 'warn' | 'error' | 'dim',
): string {
  switch (status) {
    case 'ok':
      return pc.green(text);
    case 'warn':
      return pc.yellow(text);
    case 'error':
      return pc.red(text);
    case 'dim':
      return pc.dim(text);
  }
}

export function section(title: string): void {
  console.log(pc.bold(pc.cyan(`  ${title}`)));
  console.log('');
}

export function table(
  headers: string[],
  rows: string[][],
  indent = 4,
): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => (r[i] || '').length)),
  );
  const pad = ' '.repeat(indent);

  console.log(
    pad +
      headers.map((h, i) => pc.dim(h.padEnd(colWidths[i]))).join('  '),
  );
  console.log(
    pad + colWidths.map((w) => pc.dim('─'.repeat(w))).join('  '),
  );

  for (const row of rows) {
    console.log(
      pad + row.map((c, i) => (c || '').padEnd(colWidths[i])).join('  '),
    );
  }
}

export function truncate(text: string, len: number): string {
  const oneLine = text.replace(/\n/g, ' ');
  return oneLine.length > len ? oneLine.slice(0, len - 1) + '…' : oneLine;
}
