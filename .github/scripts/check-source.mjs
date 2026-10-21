import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
const paths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
const forbidden = /(^|\/)(?:\.env(?:\..*)?|[^/]+\.(?:db|sqlite|sqlite3|pem|key)|id_rsa|id_ed25519)$/;
const template = /(?:\.example|\.sample|\.template)$/;
const tokens = /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|sk-proj-[A-Za-z0-9_-]{30,}|sk-ant-[A-Za-z0-9_-]{30,}|AKIA[A-Z0-9]{16})\b|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/;
let errors = 0;
for (const path of paths) {
  if (forbidden.test(path) && !template.test(path)) { console.error(`Unapproved sensitive file: ${path}`); errors++; }
  const info = await stat(path).catch(() => null);
  if (!info?.isFile()) continue;
  if (info.size > 90 * 1024 * 1024) { console.error(`Oversized Git source file: ${path}`); errors++; }
  if (info.size <= 8 * 1024 * 1024 && tokens.test(await readFile(path, 'utf8'))) { console.error(`Potential credential in ${path}; inspect privately.`); errors++; }
}
if (errors) process.exitCode = 1;
else console.log(`Checked ${paths.length} tracked paths for sensitive files, oversized files, and recognizable credentials.`);
