// SandboxShell — a fake Linux shell for public SSH visitors.
//
// SECURITY: this replaces the old BashPassthrough (real bash on the host PC)
// so that anyone on the internet who `ssh`s in CANNOT touch the real machine.
// It spawns no child processes, reads no files, and makes no network calls.
// Every command is answered from in-memory strings and the portfolio's own
// content renderers, so `cat about.txt` is byte-identical to the `about`
// command in the portfolio menu.
//
// It mimics a small Linux box well enough to feel real: a virtual filesystem
// (/home/guest with the portfolio as .txt files, a few /etc files), common
// commands, and a couple of easter eggs (sudo, rm -rf /, reboot).

import {
  content,
  c,
  cmdAbout,
  cmdSkills,
  cmdWork,
  cmdExperience,
  cmdCredentials,
  cmdContact,
  cmdNeofetch,
} from './commands.mjs'

// Virtual directory tree. Keys are absolute paths, values are entry names.
const DIRS = {
  '/': ['bin', 'boot', 'dev', 'etc', 'home', 'lib', 'opt', 'proc', 'root', 'run', 'sys', 'tmp', 'usr', 'var'],
  '/bin': ['bash', 'cat', 'date', 'echo', 'ls', 'pwd', 'uname', 'whoami'],
  '/etc': ['hostname', 'motd', 'os-release', 'passwd', 'shadow'],
  '/home': ['guest'],
  '/home/guest': [
    '.bashrc',
    'about.txt',
    'contact.txt',
    'credentials.txt',
    'experience.txt',
    'readme.md',
    'skills.txt',
    'work.txt',
  ],
}

// Virtual files. Keys are absolute paths, values are the full text content.
const FILES = {
  '/home/guest/about.txt': cmdAbout(),
  '/home/guest/skills.txt': cmdSkills(),
  '/home/guest/work.txt': cmdWork(),
  '/home/guest/experience.txt': cmdExperience(),
  '/home/guest/credentials.txt': cmdCredentials(),
  '/home/guest/contact.txt': cmdContact(),
  '/home/guest/readme.md': [
    '# The Signal — sandbox shell',
    '',
    "You are `guest` inside a sandbox that mimics a Linux box.",
    'Nothing here touches the real machine: no filesystem, no network, no processes.',
    '',
    'Browse the portfolio:',
    '  cat about.txt      cat skills.txt       cat work.txt',
    '  cat experience.txt  cat credentials.txt  cat contact.txt',
    '',
    "Or type `neofetch`, `ls`, `whoami`, `date`.",
    '',
    'This is a demo of what it feels like to ssh into my portfolio.',
    'The same content lives in the terminal menu and on the web.',
  ].join('\n'),
  '/home/guest/.bashrc': [
    "# this is not your .bashrc. it's a portfolio.",
    "export PS1='\\e[32mguest@signal\\e[0m:\\e[34m~\\e[0m\\$ '",
    "alias ll='ls -la'",
    '# if you are reading this, you found the sandbox. nice.',
  ].join('\n'),
  '/etc/motd': [
    'Welcome to The Signal.',
    'User: guest   Host: signal',
    "This is a portfolio, not a real server. Try `ls` and `cat about.txt`.",
  ].join('\n'),
  '/etc/os-release': [
    'NAME="The Signal"',
    'VERSION="4 (sandbox)"',
    'ID=signal',
    'PRETTY_NAME="The Signal 4 — a portfolio that speaks SSH"',
    'HOME_URL="ssh -p 2222 guest@signal"',
    'SUPPORT_URL="type `contact`"',
  ].join('\n'),
  '/etc/passwd': [
    'root:x:0:0:root:/root:/bin/bash',
    'guest:x:1000:1000:guest,,,:/home/guest:/bin/bash',
  ].join('\n'),
  '/etc/hostname': 'signal',
}

const HOME = '/home/guest'

// Strip ANSI so we can measure real width for column layout.
function visibleLen(s) {
  return s.replace(/\x1b\[[0-9;]*m/g, '').length
}

// Tiny shlex: split on unquoted whitespace, keep quotes out of tokens.
function shlex(line) {
  const out = []
  let cur = ''
  let inS = false
  let inD = false
  for (const ch of line) {
    if (ch === "'" && !inD) {
      inS = !inS
      continue
    }
    if (ch === '"' && !inS) {
      inD = !inD
      continue
    }
    if (/\s/.test(ch) && !inS && !inD) {
      if (cur) {
        out.push(cur)
        cur = ''
      }
      continue
    }
    cur += ch
  }
  if (cur) out.push(cur)
  return out
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export class SandboxShell {
  constructor() {
    // Colors come straight from the portfolio renderer so the sandbox and
    // the menu share one look. No host data is needed: everything is static.
    this.c = c
    this.cwd = HOME
    // A plausible boot time ~3h12m in the past so `uptime` looks natural.
    this.boot = Date.now() - (3 * 3600 + 12 * 60) * 1000
  }

  prompt() {
    const dir = this.cwd === HOME ? '~' : this.cwd
    return (
      this.c.green +
      'guest@signal' +
      this.c.reset +
      ':' +
      this.c.blue +
      dir +
      this.c.reset +
      '$ '
    )
  }

  resolvePath(arg) {
    if (!arg || arg === '.' || arg === '~' || arg === '$HOME') return HOME
    let p
    if (arg.startsWith('/')) p = arg
    else p = this.cwd === '/' ? '/' + arg : this.cwd + '/' + arg
    const parts = p.split('/').filter(Boolean)
    const stack = []
    for (const seg of parts) {
      if (seg === '.') continue
      if (seg === '..') stack.pop()
      else stack.push(seg)
    }
    return '/' + stack.join('/')
  }

  _isDir(p) {
    return DIRS[p] !== undefined
  }

  _perm(p) {
    return this._isDir(p) ? 'drwxr-xr-x' : '-rw-r--r--'
  }

  _size(p) {
    if (this._isDir(p)) return 4096
    const f = FILES[p]
    return f ? f.length : 0
  }

  _color(p) {
    return this._isDir(p) ? this.c.blue : ''
  }

  _dateStr() {
    const d = new Date()
    const pad = (n) => String(n).padStart(2, '0')
    return `${MONTHS[d.getUTCMonth()]}  ${d.getUTCDate()} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
  }

  _lsPlain(dir) {
    let names = (DIRS[dir] || []).slice()
    names = names.filter((n) => !n.startsWith('.')) // hide dotfiles unless -a
    const cols = 80
    const maxLen = Math.max(10, ...names.map((n) => visibleLen(n)))
    const perRow = Math.max(1, Math.floor(cols / (maxLen + 2)))
    const rows = []
    for (let i = 0; i < names.length; i += perRow) rows.push(names.slice(i, i + perRow))
    return rows
      .map((r) =>
        r
          .map((n, i) => {
            const shown = this._color(dir === '/' ? '/' + n : dir + '/' + n) + n + (this._isDir(dir === '/' ? '/' + n : dir + '/' + n) ? '/' : '') + this.c.reset
            const pad = i === r.length - 1 ? 0 : Math.max(0, maxLen - visibleLen(n)) + 2
            return shown + ' '.repeat(pad)
          })
          .join(''),
      )
      .map((l) => l.replace(/\s+$/, ''))
      .join('\n')
  }

  _lsDetail(dir) {
    let names = (DIRS[dir] || []).slice()
    let out = ''
    const total = Math.ceil(
      (names.reduce((s, n) => s + this._size(dir === '/' ? '/' + n : dir + '/' + n), 0) + 8192) / 1024,
    )
    out += 'total ' + total + '\n'
    out += `${this.c.blue}drwxr-xr-x${this.c.reset} guest guest ${String(4096).padStart(5)} ${this._dateStr()} ${this.c.blue}..${this.c.reset}\n`
    for (const n of names) {
      const full = dir === '/' ? '/' + n : dir + '/' + n
      out +=
        `${this.c.blue}${this._perm(full)}${this.c.reset} guest guest ${String(this._size(full)).padStart(5)} ${this._dateStr()} ` +
        `${this._color(full)}${n}${this._color(full) && this._isDir(full) ? '/' : ''}${this._color(full) ? this.c.reset : ''}\n`
    }
    return out.replace(/\n$/, '')
  }

  run(line) {
    const raw = line.trim()
    if (!raw) return { text: '' }
    const toks = shlex(raw)
    const cmd = toks[0]
    const args = toks.slice(1)

    // Session control (handled by the REPL via these flags).
    if (cmd === 'exit' || cmd === 'quit' || cmd === 'logout') return { toPortfolio: true }
    if (cmd === 'clear' || cmd === 'cls') return { clear: true }

    switch (cmd.toLowerCase()) {
      case 'help':
        return {
          text:
            'sandbox shell — try: ls · pwd · cat <file> · echo · whoami · uname · date · uptime · neofetch · exit\n' +
            'the portfolio files live in /home/guest  (cat about.txt, skills.txt, work.txt, ...)',
        }

      case 'ls':
      case 'dir': {
        const dir = this.cwd
        if (!this._isDir(dir)) return { text: `${this.c.red}ls: cannot access '${dir}': No such file or directory${this.c.reset}` }
        const l = args.some((a) => a.startsWith('-') && a.includes('l'))
        return { text: l ? this._lsDetail(dir) : this._lsPlain(dir) }
      }

      case 'cd': {
        const target = args[0] || '~'
        const p = this.resolvePath(target)
        if (p === '/' || this._isDir(p)) {
          this.cwd = p
          return { text: '' }
        }
        return { text: `${this.c.red}bash: cd: ${target}: No such file or directory${this.c.reset}` }
      }

      case 'pwd':
        return { text: this.cwd }

      case 'cat': {
        if (!args.length) return { text: `${this.c.red}cat: missing operand${this.c.reset}` }
        let out = ''
        for (const a of args) {
          const p = this.resolvePath(a)
          let piece
          if (p === '/etc/shadow') piece = `${this.c.red}cat: /etc/shadow: Permission denied${this.c.reset}`
          else if (FILES[p] !== undefined) piece = FILES[p]
          else if (this._isDir(p)) piece = `${this.c.red}cat: ${p}: Is a directory${this.c.reset}`
          else piece = `${this.c.red}cat: ${p}: No such file or directory${this.c.reset}`
          out += (out ? '\n' : '') + piece
        }
        return { text: out }
      }

      case 'echo': {
        let a = args.slice()
        if (a[0] === '-n') a = a.slice(1)
        return { text: a.join(' ') }
      }

      case 'whoami':
        return { text: 'guest' }

      case 'id':
        return { text: 'uid=1000(guest) gid=1000(guest) groups=1000(guest)' }

      case 'hostname':
        return { text: 'signal' }

      case 'uname': {
        if (args.includes('-a'))
          return { text: 'Linux signal 6.9.0-signal #1 SMP PREEMPT_DYNAMIC The-Signal x86_64 GNU/Linux' }
        if (args.includes('-r')) return { text: '6.9.0-signal' }
        if (args.includes('-m')) return { text: 'x86_64' }
        return { text: 'Linux' }
      }

      case 'date': {
        const d = new Date()
        const pad = (n) => String(n).padStart(2, '0')
        const day = String(d.getUTCDate()).padStart(2, ' ')
        return {
          text: `${DAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${day} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC ${d.getUTCFullYear()}`,
        }
      }

      case 'uptime': {
        const now = new Date()
        const pad = (n) => String(n).padStart(2, '0')
        const upSec = Math.max(0, Math.floor((Date.now() - this.boot) / 1000))
        const h = Math.floor(upSec / 3600)
        const m = Math.floor((upSec % 3600) / 60)
        const dur = h ? `${h} hour${h > 1 ? 's' : ''}${m ? `, ${m} min` : ''}` : `${m} min`
        return {
          text: ` ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())} up ${dur},  1 user,  load average: 0.00, 0.01, 0.05`,
        }
      }

      case 'neofetch':
        return { text: cmdNeofetch() }

      case 'motd':
        return { text: FILES['/etc/motd'] }

      case 'history':
        return { text: `  1  ssh -p 2222 guest@signal\n  2  ls\n  3  cat about.txt\n  4  ${raw}` }

      case 'whois':
        return { text: cmdContact() }

      // ── Easter eggs ──────────────────────────────────────────────────
      case 'sudo':
        return {
          text: `${this.c.red}guest is not in the sudoers file. This incident will be reported.${this.c.reset}`,
        }

      case 'rm': {
        const hasRF = args.includes('-rf') || args.includes('-fr') || (args.includes('-r') && args.includes('-f'))
        const target = args.find((a) => !a.startsWith('-'))
        const isRootish = target === '/' || target === '~' || target === '.' || target === '/*' || target === '.*'
        if (hasRF && isRootish) {
          return { text: `${this.c.red}rm: it's a portfolio, not your machine — there is nothing to delete. nice try. 🙂${this.c.reset}` }
        }
        return { text: `${this.c.dim}nothing happened. there's no real filesystem here.${this.c.reset}` }
      }

      case 'reboot':
      case 'shutdown':
        return { text: `${this.c.dim}you can't turn me off. i'm a portfolio, not a server.${this.c.reset}` }

      case 'curl':
      case 'wget':
        return {
          text:
            `${this.c.red}no external network in the sandbox.${this.c.reset}\n` +
            `${this.c.dim}  (the whole point is the portfolio itself — try \`neofetch\`)${this.c.reset}`,
        }

      case 'su':
      case 'passwd':
        return { text: `${this.c.red}su: authentication failure${this.c.reset}` }

      case 'top':
      case 'htop':
      case 'vi':
      case 'vim':
        return { text: `${this.c.dim}${cmd}: not installed. try \`neofetch\` instead.${this.c.reset}` }

      default:
        return { text: `${this.c.red}bash: ${cmd}: command not found${this.c.reset}` }
    }
  }

  // Called by the REPL on resize. The sandbox has no real PTY; width only
  // matters for `ls` wrapping, which we keep at a fixed 80 for simplicity.
  resize(cols, rows) {
    void cols
    void rows
  }

  dispose() {
    // Nothing to clean up — no child process was ever started.
  }
}
