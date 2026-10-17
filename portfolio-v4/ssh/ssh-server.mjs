// ssh-server.mjs — SSH server for the portfolio.
//
// - Listens on 0.0.0.0:2222 (override with PORT).
// - Host key:  ssh/keys/host_ed25519
// - Auth:      publickey only, keys from ssh/keys/authorized_keys
// - Shell:     PortfolioShell (portfolio REPL); `shell` drops into the
//              SandboxShell (fake Linux box — no real processes/files).
// - One-shot:  ssh -p 2222 guest@host contact   runs a command, prints, exits.

import ssh2 from 'ssh2'
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PortfolioShell } from './repl.mjs'

const { Server, utils: { parseKey } } = ssh2

// A client dropping mid-handshake surfaces as a socket 'error' on a per-
// connection Client instance. If we have not (yet) attached our own handler
// for that client, Node treats it as unhandled and kills the whole process.
// This guard keeps the server alive; per-client errors are still logged by
// the 'error' listener below.
process.on('uncaughtException', (err) => {
  if (err && err.code === 'ECONNRESET') return
  console.error('[signal] uncaught exception:', err)
  process.exit(1)
})
const here = path.dirname(fileURLToPath(import.meta.url))

const PORT = Number(process.env.PORT || 2222)
const HOST_KEY_PATH = path.join(here, 'keys', 'host_ed25519')
const AUTH_KEYS_PATH = path.join(here, 'keys', 'authorized_keys')

// ── Load keys ──────────────────────────────────────────────────────────

let hostKeys
try {
  hostKeys = [readFileSync(HOST_KEY_PATH, 'utf8')]
} catch {
  console.error('[signal] missing host key at', HOST_KEY_PATH)
  console.error('[signal] run: npm run gen:keys')
  process.exit(1)
}

const allowedKeys = []
if (existsSync(AUTH_KEYS_PATH)) {
  for (const line of readFileSync(AUTH_KEYS_PATH, 'utf8').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    try {
      allowedKeys.push(parseKey(t))
    } catch (e) {
      console.warn('[signal] skipping unparseable authorized_keys line:', e.message)
    }
  }
}
if (allowedKeys.length === 0) {
  console.warn('[signal] no authorized_keys entries — nobody can log in.')
}

// ── Rate limiting (the server is publicly reachable via Tailscale Funnel) ───
// Behind Funnel all public traffic arrives from one local address, so this
// behaves as a global bucket there and as per-IP limiting on direct
// LAN/tailnet connections. Loopback is exempt from auth-failure locking
// (only local processes can claim it — integration tests must not self-lock)
// but still counts against the connection cap.
const RL = {
  connWindowMs: 60_000,
  connMax: 60, // new connections per IP per minute (global under Funnel)
  maxConcurrent: 64, // global cap on live clients
  failWindowMs: 120_000,
  failMax: 10, // auth failures in the window → lock
  lockMs: 600_000, // 10 minutes
}
const ipState = new Map() // ip → { conns: [ts], fails: [ts], lockedUntil: 0 }
let activeConns = 0

function ipEntry(ip) {
  let e = ipState.get(ip)
  if (!e) {
    e = { conns: [], fails: [], lockedUntil: 0 }
    ipState.set(ip, e)
  }
  const now = Date.now()
  e.conns = e.conns.filter((t) => now - t < RL.connWindowMs)
  e.fails = e.fails.filter((t) => now - t < RL.failWindowMs)
  return e
}

const isLoopback = (ip) => ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1'

function noteConn(ip) {
  const e = ipEntry(ip)
  e.conns.push(Date.now())
  if (activeConns >= RL.maxConcurrent) return 'too many concurrent connections (global cap)'
  if (e.conns.length > RL.connMax) return 'connection rate limit'
  return null
}

function noteAuthFail(ip) {
  const e = ipEntry(ip)
  e.fails.push(Date.now())
  if (e.fails.length > RL.failMax && !isLoopback(ip)) {
    e.lockedUntil = Date.now() + RL.lockMs
    e.fails = []
    console.warn(
      `[signal] ${ip}: ${RL.failMax}+ auth failures in ${RL.failWindowMs / 60000} min — locked for ${RL.lockMs / 60000} min`,
    )
  }
}

setInterval(() => {
  const now = Date.now()
  for (const [ip, e] of ipState) {
    const stale =
      now - (e.conns.at(-1) ?? 0) > RL.connWindowMs * 2 &&
      now - (e.fails.at(-1) ?? 0) > RL.failWindowMs * 2 &&
      now > (e.lockedUntil || 0)
    if (stale) ipState.delete(ip)
  }
}, 5 * 60_000).unref()

// ── Server ─────────────────────────────────────────────────────────────

const server = new Server({ hostKeys }, null)

server.on('connection', (client, info) => {
  let shell = null
  // ssh2 gives the peer address on the 'connection' event's info object
  // (client.socket does NOT exist on the server side — the earlier code
  // bucketed everyone as 'unknown').
  const ip = (info && info.ip) || (client._sock && client._sock.remoteAddress) || 'unknown'
  let authUser = ''

  // Rate limiting: reject early, before any protocol handshake.
  if (ipEntry(ip).lockedUntil > Date.now()) {
    console.warn('[signal] dropping locked client from', ip)
    client.end()
    return
  }
  const rlReason = noteConn(ip)
  if (rlReason) {
    console.warn('[signal] dropping client from', ip, ':', rlReason)
    client.end()
    return
  }
  activeConns++

  client.on('authentication', (ctx) => {
    authUser = ctx.username
    const { username, method } = ctx
    if (username !== 'guest') {
      noteAuthFail(ip)
      return ctx.reject()
    }
    if (method === 'publickey') {
      const key = allowedKeys.find((k) => {
        try {
          return k.type === ctx.key.algo && k.getPublicSSH().equals(ctx.key.data)
        } catch {
          return false
        }
      })
      if (!key) {
        noteAuthFail(ip)
        return ctx.reject()
      }
      if (ctx.blob && ctx.signature) {
        try {
          const ok = key.verify(ctx.blob, ctx.signature, ctx.hashAlgo)
          if (ok !== true) {
            noteAuthFail(ip)
            return ctx.reject()
          }
        } catch {
          noteAuthFail(ip)
          return ctx.reject()
        }
      }
      // ctx.blob undefined = client asking "is this key allowed?" → accept
      return ctx.accept()
    }
    // We do not accept 'none', password, or anything else.
    noteAuthFail(ip)
    return ctx.reject()
  })

  client.on('ready', () => {
    console.log(`[signal] authenticated: ${authUser || 'guest'} from ${ip}`)
    client.on('session', (accept) => {
      const session = accept()

      session.on('exec', (acceptExec, _rejectExec, info) => {
        // One-shot command: run it as a portfolio command and exit.
        const cmdStream = acceptExec()
        const out = runOneShot(info.command)
        cmdStream.write(out)
        cmdStream.exit(0)
        cmdStream.end()
      })

      // The client requests a pseudo-terminal before the shell. We are a
      // "dumb" server (no real PTY on Windows), but we must still accept the
      // request or the client times out ("Unable to request a pseudo-terminal").
      let ptyInfo = null
      session.on('pty', (acceptPty, _rejectPty, data) => {
        ptyInfo = data
        acceptPty()
      })

      session.on('shell', (acceptShell, _rejectShell, info) => {
        const channel = acceptShell()
        const term = ptyInfo || info.terminal || {}
        shell = new PortfolioShell({
          session: {
            stdout: {
              write(s) {
                channel.write(s)
              },
            },
            exit(code) {
              channel.exit(code || 0)
            },
            end() {
              channel.end()
            },
          },
          term: {
            cols: term.cols,
            rows: term.rows,
            name: term.term,
          },
          onExit: () => {
            shell = null
          },
        })

        // Show banner + prompt immediately. Over raw TCP tunnels (Tailscale
        // Funnel) there is no client-side echo to reveal anything, so without
        // this a visitor would see a blank screen until their first keystroke.
        shell.greetNow()

        channel.on('data', (d) => {
          if (shell) shell.write(d.toString('utf8'))
        })
        channel.on('close', () => {
          if (shell) shell.dispose()
          shell = null
          console.log(`[signal] session closed from ${ip}`)
        })
        channel.on('stderr', () => {})

        // Window size changes (session-level event)
        session.on('window-change', (acceptWc, _rejectWc, info) => {
          if (shell) shell.resize(info.cols, info.rows)
          if (typeof acceptWc === 'function') acceptWc()
        })

        // Initial prompt comes from PortfolioShell's greeting.
      })
    })
  })

  client.on('close', () => {
    activeConns--
    if (shell) shell.dispose()
    shell = null
  })
  client.on('error', (e) => {
    console.warn('[signal] client error from', ip, ':', e.message)
  })
})

server.on('error', (e) => {
  console.error('[signal] server error:', e.message)
  if (e.code === 'EADDRINUSE') {
    console.error(`[signal] port ${PORT} is already in use.`)
    process.exit(1)
  }
})

server.listen(PORT, '0.0.0.0', () => {
  const addr = server.address()
  console.log('')
  console.log('  ╔═╗╔╦╗╦ ╦╔═╗╔═╗')
  console.log('  ╠╩╝ ║ ║ ║╠═╣║╣ ')
  console.log('  ╩   ╩ ╚═╝╩ ╩╚═╝')
  console.log('')
  console.log(`  portfolio v4 · SSH server listening on 0.0.0.0:${addr.port}`)
  console.log(`  user: guest   auth: publickey (${allowedKeys.length} key(s))`)
  console.log('')
  console.log('  connect from your machine:')
  printConnectHint(addr.port)
  console.log('')
})

function printConnectHint(port) {
  const lan = lanAddress()
  if (lan) {
    console.log(`    ssh -p ${port} guest@${lan}`)
    console.log(`  (one-shot)   ssh -p ${port} guest@${lan} skills`)
  }
  console.log(`  local test:   ssh -p ${port} guest@127.0.0.1`)
}

function lanAddress() {
  try {
    const os = (await_os)()
    const ifaces = os.networkInterfaces()
    for (const name of Object.keys(ifaces)) {
      for (const i of ifaces[name] || []) {
        if (i.family === 'IPv4' && !i.internal) return i.address
      }
    }
  } catch {
    /* ignore */
  }
  return null
}
// lazy import to keep top-level light
import os from 'node:os'
const await_os = () => os

// ── One-shot exec ──────────────────────────────────────────────────────

function runOneShot(command) {
  // Accept forms:
  //   ssh host                       → interactive (handled above)
  //   ssh host about                 → portfolio command
  //   ssh host "skills && contact"   → split on && ; / ;
  const parts = String(command).split(/\s*(?:&&|;)\s*/).map((s) => s.trim()).filter(Boolean)
  const out = []
  for (const part of parts) {
    out.push(`${renderOne(part)}\r\n`)
  }
  return out.join('')
}

function renderOne(part) {
  // strip leading ssh-style args we don't understand
  const cmd = part.split(/\s+/)[0]
  const c2 = cmd.toLowerCase()
  if (c2 === 'about') return R.cmdAbout()
  if (c2 === 'skills') return R.cmdSkills()
  if (c2 === 'work' || c2 === 'projects') return R.cmdWork()
  if (c2 === 'experience') return R.cmdExperience()
  if (c2 === 'credentials') return R.cmdCredentials()
  if (c2 === 'contact' || c2 === 'email') return R.cmdContact()
  if (c2 === 'whoami') return R.cmdWhoami()
  if (c2 === 'neofetch') return R.cmdNeofetch()
  if (c2 === 'help' || c2 === '?') return R.cmdHelp()
  if (c2 === 'uptime') return R.cmdUptime()
  return R.cmdUnknown(cmd)
}

import * as R from './commands.mjs'
