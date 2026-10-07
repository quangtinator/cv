// BashPassthrough — drives a real bash over stdio pipes and forwards every
// byte both ways unchanged.
//
// Why passthrough and not a custom line editor: when bash's stdin is a pipe
// (not a TTY), bash runs its own "dumb terminal" readline, which already
//   - echoes each character as it is typed,
//   - prints the PS1 prompt (we set a branded one in bashrc.signal),
//   - handles arrows / home / end / delete / history / Ctrl+U / Ctrl+C.
// Verified live against Git Bash: feeding input char-by-char produces
// char-by-char echo on stderr, and up-arrow recalls history. If we echoed
// locally here, every keystroke would appear twice. So this class is just a
// pipe plus lifecycle handling.
//
// Known limitation: full-screen programs that need a real TTY (vi, top, htop)
// won't work well — there is no PTY on this host. Plain command use is fine.

import { spawn, spawnSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// msys/Git-bash wants POSIX-style paths (/c/Users/...) in argv values such as
// --rcfile; a Windows path (C:\Users\...) makes it choke on the argument.
export function toMsysPath(winPath) {
  if (!winPath) return winPath
  const m = winPath.match(/^([A-Za-z]):[\\\/](.*)$/)
  if (m) return '/' + m[1].toLowerCase() + '/' + m[2].replace(/\\/g, '/')
  return winPath.replace(/\\/g, '/')
}

function extraPathsFor(bin) {
  // Git-bash lives at <git>/usr/bin/bash.exe; its core utilities (ls, cat,
  // sleep, grep, ...) live in <git>/mingw64/bin and <git>/usr/bin. The
  // parent PATH (cmd.exe, a service, an IDE) does not reliably include
  // those, so we prepend them ourselves when spawning the shell.
  const norm = String(bin).replace(/\\/g, "/")
  const m = norm.match(/^(.*\/Git\/usr\/bin|.*\/Git\/mingw64\/bin)/)
  if (m) {
    const gitRoot = m[1].replace(/\/usr\/bin$/, '').replace(/\/mingw64\/bin$/, '')
    const dirs = [gitRoot + '/mingw64/bin', gitRoot + '/usr/bin']
    return dirs.filter((d) => {
      try {
        return existsSync(d)
      } catch {
        return false
      }
    })
  }
  return []
}
export function detectShell() {
  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA
    const candidates = [
      'C:/Program Files/Git/usr/bin/bash.exe',
      'C:/Program Files (x86)/Git/usr/bin/bash.exe',
      local ? path.join(local, 'Programs/Git/usr/bin/bash.exe') : null,
    ].filter(Boolean)
    for (const c of candidates) if (existsSync(c)) return { bin: c, args: [], extraPaths: extraPathsFor(c) }
    try {
      const r = spawnSync('where', ['bash'], { encoding: 'utf8', windowsHide: true })
      if (r.status === 0 && r.stdout) {
        const first = r.stdout.split(/\r?\n/)[0].trim()
        if (first) return { bin: first, args: [], extraPaths: extraPathsFor(first) }
      }
    } catch {
      /* no where on PATH */
    }
    return null
  }
  for (const c of ['/bin/bash', '/usr/bin/bash']) {
    if (existsSync(c)) return { bin: c, args: [], extraPaths: [] }
  }
  return null
}

export class BashPassthrough {
  constructor({ bin, cols, rows, term, onOutput, onExit, extraPaths = [] }) {
    this.onOutput = onOutput || (() => {})
    this.closed = false
    this.bootDone = false

    // NOTE the flag order: this bash rejects `-i --rcfile X` but accepts
    // `--rcfile X -i`. The rcfile path must be POSIX-style for msys.
    this.proc = spawn(bin, ['--rcfile', toMsysPath(rcfileFor()), '-i'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        // Prepend the shell's own bin dirs to PATH so core utilities
        // resolve no matter what PATH the parent process inherited.
        PATH: [...extraPaths, process.env.PATH || ''].filter(Boolean).join(
          process.platform === 'win32' ? ';' : ':',
        ),
        TERM: term || 'xterm-256color',
        COLS: String(cols || 80),
        LINES: String(rows || 24),
      },
      cwd: process.env.HOME || process.cwd(),
      windowsHide: true,
    })

    // bash writes its prompt and echo to stderr in dumb-terminal mode, and
    // command output to stdout. Both go to the SSH client, in arrival order
    // per stream (the two streams are independent; interleaving is close
    // enough for a shell — this is the same trade-off every pipe-based
    // terminal proxy makes).
    this.proc.stdout.on('data', (d) => this._forward(d.toString('utf8')))
    this.proc.stderr.on('data', (d) => this._forward(d.toString('utf8')))

    this.proc.on('error', (e) => {
      this.onOutput('\r\n\x1b[31m[signal] shell error: ' + e.message + '\x1b[0m\r\n')
      this._done()
    })
    this.proc.on('exit', (code) => {
      this.onOutput('\r\n\x1b[2m[signal] bash exited' + (code ? ` (code ${code})` : '') + '\x1b[0m\r\n')
      this._done()
      if (onExit) onExit(code)
    })
  }

  _forward(text) {
    if (this.closed) return
    // bash complains once at startup that there is no job control (no TTY).
    // It is true and harmless; drop exactly those two known lines so the
    // guest sees a clean shell. Everything else passes through untouched.
    let out = text
    if (!this.bootDone) {
      out = out
        .split('\n')
        .filter((l) => !/cannot set terminal process group|no job control in this shell/.test(l))
        .join('\n')
      this.bootDone = true
    }
    if (out) this.onOutput(out)
  }

  // Raw terminal bytes from the SSH client, straight into bash.
  write(input) {
    if (this.closed || !this.proc.stdin.writable) return
    this.proc.stdin.write(input)
  }

  resize(cols, rows) {
    // We can't tell bash about a new size without injecting a visible command
    // into the guest's shell, and a stale wrapping width is far less annoying
    // than a stray typed line. So this is deliberately a no-op: output wrapping
    // follows the COLUMNS/LINES bash was started with. (The portfolio REPL —
    // which owns its own rendering — still picks up resizes.)
    void cols
    void rows
  }

  kill() {
    if (this.closed) return
    this._done()
    try {
      this.proc.kill()
    } catch {
      /* already gone */
    }
  }

  _done() {
    this.closed = true
  }
}

function rcfileFor() {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const p = path.join(here, 'bashrc.signal')
  if (!existsSync(p)) {
    writeFileSync(
      p,
      [
        'export TERM=${TERM:-xterm-256color}',
        "PS1='\\033[32mguest@signal\\033[0m:\\033[34m~\\033[0m$ '",
        'export PS1',
        'alias ll="ls -la"',
        '',
      ].join('\n'),
      'utf8',
    )
  }
  return p
}
