---
name: manage
description: Interactive NanoClaw management — check status, start/stop/restart service, view logs, manage containers, browse scheduled tasks, query database. Uses the nclaw Node.js CLI.
---

# NanoClaw Management

Management skill using the `nclaw` CLI built with Commander.js + @clack/prompts.

## CLI Location

```
node bin/nclaw.js <command>
```

## Usage Modes

### 1. Interactive menu (when user says "manage", "dashboard", "панель управління")

The interactive mode needs a TTY. Tell the user:

```
Run `! node bin/nclaw.js` in the prompt to launch the interactive menu.
```

### 2. Direct commands (when user asks for a specific action)

Run via Bash — these produce clean non-interactive output:

| User intent | Command |
|-------------|---------|
| Check status | `node bin/nclaw.js status` |
| Start service | `node bin/nclaw.js start` |
| Stop service | `node bin/nclaw.js stop` |
| Restart | `node bin/nclaw.js restart` |
| View logs (last N) | `node bin/nclaw.js logs tail -n 50` |
| Follow logs | Tell user: `! node bin/nclaw.js logs follow` |
| List containers | `node bin/nclaw.js containers list` |
| Container logs | `node bin/nclaw.js logs container <name>` |
| List tasks | `node bin/nclaw.js tasks list` |
| Task history | `node bin/nclaw.js tasks history` |
| Pause task | `node bin/nclaw.js tasks pause <id>` |
| Resume task | `node bin/nclaw.js tasks resume <id>` |
| Delete task | `node bin/nclaw.js tasks delete <id>` |
| List groups | `node bin/nclaw.js groups list` |
| View group config | `node bin/nclaw.js groups view <name>` |
| DB: groups | `node bin/nclaw.js db groups` |
| DB: messages | `node bin/nclaw.js db messages -n 20` |
| DB: sessions | `node bin/nclaw.js db sessions` |
| Build TypeScript | `node bin/nclaw.js build ts` |
| Build container | `node bin/nclaw.js build container` |
| Build all | `node bin/nclaw.js build all` |

### 3. Getting help

```bash
node bin/nclaw.js --help
node bin/nclaw.js tasks --help
node bin/nclaw.js logs --help
```

## Important Notes

- Commands that produce output (status, tasks list, db queries) work non-interactively — run them directly via Bash
- Commands that stream (logs follow, container logs -f) need a TTY — tell the user to run with `!` prefix
- Commands that need confirmation (delete, kill-all) use @clack/prompts confirm — these also need TTY, so tell the user to run with `!` prefix
- The CLI uses `sudo` for systemctl/journalctl — same as the service itself
- Database is at `store/messages.db`, accessed via better-sqlite3 (same as main app)
