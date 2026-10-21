import { execFileSync } from 'node:child_process';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = process.env.PAGES_BASE_PATH || '/cv/';
if (!/^\/[a-zA-Z0-9/_-]*\/$/.test(base)) throw new Error('PAGES_BASE_PATH must be an absolute directory path ending in /.');
const vite = resolve('node_modules/vite/bin/vite.js');
execFileSync(process.execPath, [vite, 'build'], { stdio: 'inherit', env: { ...process.env, PAGES_BASE_PATH: base } });
execFileSync(process.execPath, [vite, 'build'], { cwd: 'portfolio-v4', stdio: 'inherit', env: { ...process.env, PAGES_BASE_PATH: `${base}v4/` } });
await mkdir('dist/v4', { recursive: true });
await cp('portfolio-v4/dist', 'dist/v4', { recursive: true });
await writeFile('dist/v4/signal-config.json', JSON.stringify({ publicHost: null, publicSshPort: null }));
await writeFile('dist/.nojekyll', '');
