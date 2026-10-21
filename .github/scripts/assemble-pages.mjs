import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const branch = process.env.GITHUB_REF_NAME;
if (!['main', 'staging'].includes(branch)) throw new Error('Only staging and main can publish.');
const root = resolve('.pages');
const destination = branch === 'staging' ? resolve(root, 'staging') : root;
if (destination !== root && !destination.startsWith(root + sep)) throw new Error('Invalid publish path.');
await mkdir(destination, { recursive: true });
for (const entry of await readdir(destination)) {
  if (entry === '.git' || (branch === 'main' && entry === 'staging')) continue;
  await rm(resolve(destination, entry), { recursive: true, force: true });
}
await cp(resolve('dist'), destination, { recursive: true });
await writeFile(resolve(destination, 'deployment.json'), JSON.stringify({ commit: process.env.GITHUB_SHA, branch }));
await mkdir('.pages-dist', { recursive: true });
await cp(root, resolve('.pages-dist'), { recursive: true, filter: source => source !== resolve(root, '.git') });
