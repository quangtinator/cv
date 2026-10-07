// gen-keys.mjs — create the SSH host key and a guest client key, and
// authorize that guest key in authorized_keys.
//
// - Host key (ssh/keys/host_ed25519): the server's identity. Clients pin its
//   fingerprint on first connect; keep it stable across restarts.
// - Guest key (ssh/keys/guest_ed25519 + .pub): the credential you hand to a
//   visitor (or use yourself for local testing). Its public half goes into
//   authorized_keys.
//
// Run: npm run gen:keys   (safe to re-run; it never overwrites existing keys)

import { existsSync, readFileSync, writeFileSync, mkdirSync, appendFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const here = path.dirname(fileURLToPath(import.meta.url))
const keysDir = path.join(here, 'keys')
mkdirSync(keysDir, { recursive: true })

const hostKey = path.join(keysDir, 'host_ed25519')
const guestKey = path.join(keysDir, 'guest_ed25519')
const authorized = path.join(keysDir, 'authorized_keys')

// Locate ssh-keygen (Windows ships it in System32\OpenSSH; Linux/mac have it
// on PATH).
function findKeygen() {
  const candidates =
    process.platform === 'win32'
      ? [
          path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'OpenSSH', 'ssh-keygen.exe'),
          'ssh-keygen',
        ]
      : ['ssh-keygen']
  for (const c of candidates) {
    const r = spawnSync(c, ['-V'], { shell: process.platform === 'win32' })
    // ssh-keygen prints usage/usage-on-stderr but exit code tells us if found
    if (r.status !== undefined && r.error === undefined) return c
  }
  return null
}

function keygen(keyPath, comment) {
  if (existsSync(keyPath)) {
    console.log(`  = ${path.basename(keyPath)} already exists, keeping it`)
    return
  }
  const kg = findKeygen()
  if (!kg) {
    console.error('[gen:keys] could not find ssh-keygen (OpenSSH). Install OpenSSH client first.')
    process.exit(1)
  }
  const r = spawnSync(kg, ['-t', 'ed25519', '-N', '', '-f', keyPath, '-C', comment], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
  if (r.status !== 0) {
    console.error('[gen:keys] ssh-keygen failed for', keyPath)
    process.exit(1)
  }
  console.log(`  + ${path.basename(keyPath)}`)
}

console.log('[gen:keys] generating keys in', keysDir)
keygen(hostKey, 'signal-host')
keygen(guestKey, 'guest@signal')

// Authorize the guest public key (idempotent).
const pub = readFileSync(guestKey + '.pub', 'utf8').trim()
let lines = existsSync(authorized) ? readFileSync(authorized, 'utf8').split(/\r?\n/).filter(Boolean) : []
if (!lines.some((l) => l.startsWith(pub.split(/\s+/)[0]) && l.includes(pub.split(/\s+/)[1]))) {
  lines.push(pub)
  writeFileSync(authorized, lines.join('\n') + '\n', 'utf8')
  console.log('  + added guest key to authorized_keys')
} else {
  console.log('  = guest key already in authorized_keys')
}

// Print the fingerprint so a first-time client can pin it.
try {
  const kg = findKeygen()
  const r = spawnSync(kg, ['-lf', guestKey + '.pub'], { encoding: 'utf8', shell: process.platform === 'win32' })
  if (r.status === 0) console.log('\n  guest key fingerprint:\n    ' + r.stdout.trim())
  const rh = spawnSync(kg, ['-lf', hostKey], { encoding: 'utf8', shell: process.platform === 'win32' })
  if (rh.status === 0) console.log('  host key fingerprint:\n    ' + rh.stdout.trim())
} catch {
  /* fingerprint is informational only */
}

console.log('\n[gen:keys] done.')
console.log('  Hand the PRIVATE guest key to a visitor: ' + guestKey)
console.log('  They add it to their own agent/config, then:  ssh -p 2222 guest@<your-host>')
console.log('  For local testing you can point your ssh client at it directly:')
console.log('    ssh -i ' + guestKey + ' -p 2222 guest@127.0.0.1')
