// PortfolioShell — the interactive loop guests land in over SSH.
// Portfolio mode: a tiny line REPL over the portfolio commands.
// `shell` switches to the SandboxShell (a fake Linux box — see
// sandbox-shell.mjs: no child processes, no filesystem, no network);
// `exit` there returns to the portfolio REPL.

import {
  BANNER,
  cmdHelp,
  cmdWhoami,
  cmdAbout,
  cmdSkills,
  cmdWork,
  cmdExperience,
  cmdCredentials,
  cmdContact,
  cmdNeofetch,
  cmdUptime,
  cmdLs,
  cmdUnknown,
  c,
} from './commands.mjs'
import { SandboxShell } from './sandbox-shell.mjs'

const PROMPT = c.greenBright + 'guest@signal' + c.reset + ':' + c.blue + 'portfolio' + c.reset + '$ '
const BANNER_ONCE = BANNER

export class PortfolioShell {
  constructor({ session, term, onExit }) {
    this.session = session // ssh2 server-side session (stdout stream)
    this.onExit = onExit
    this.mode = 'portfolio'
    this.buf = ''
    this.cursor = 0
    this.cols = (term && term.cols) || 80
    this.rows = (term && term.rows) || 24
    this.shell = null
    this.bashPromptSeen = false
    this.greetingSent = false
    this.exited = false
  }

  _out(s) {
    if (this.exited) return
    try {
      this.session.stdout.write(s)
    } catch {
      /* stream closed */
    }
  }

  // Send the greeting banner. Idempotent; normally triggered on the first
  // client write(), or eagerly via greetNow() when the shell channel opens.
  _greet() {
    if (this.greetingSent) return
    this.greetingSent = true
    this._out('\r\n' + BANNER_ONCE + '\r\n')
  }

  // Eagerly send banner + prompt as soon as the shell channel opens, so the
  // visitor sees something immediately without typing first. Needed over raw
  // TCP tunnels (e.g. Tailscale Funnel), where waiting for the first
  // keystroke would leave a blank screen.
  greetNow() {
    this._greet()
    this._prompt()
  }

  _prompt() {
    if (this.mode === 'sandbox') {
      this._out(this.sandbox.prompt())
      return
    }
    this._out(PROMPT)
  }

  write(input) {
    this._greet()
    // Both portfolio mode and sandbox mode go through the line editor;
    // the sandbox answers whole lines (SandboxShell.run), so no raw
    // byte forwarding is needed.
    this._replWrite(input)
  }

  _replWrite(input) {
    let i = 0
    while (i < input.length) {
      const ch = input[i]
      const code = input.charCodeAt(i)

      // CSI: arrows / home / end / delete
      if (ch === '\x1b' && i + 2 < input.length && input[i + 1] === '[') {
        let j = i + 2
        let params = ''
        while (j < input.length && /[0-9;~]/.test(input[j])) {
          params += input[j]
          j++
        }
        if (j < input.length) {
          this._csi(params, input[j])
          i = j + 1
          continue
        }
        i++
        continue
      }
      // Application-mode arrows
      if (ch === '\x1b' && i + 2 < input.length && input[i + 1] === 'O') {
        const f = input[i + 2]
        if (f === 'A') this._left()
        else if (f === 'B') this._right()
        i += 3
        continue
      }
      // Bracketed paste marker: strip it, keep the pasted text
      if (ch === '\x1b' && i + 3 < input.length && input[i + 1] === '[' && (input[i + 2] === '2' || input[i + 2] === '5')) {
        i += 3
        continue
      }

      switch (ch) {
        case '\r':
        case '\n':
          i++ // consume the newline
          this._enter()
          continue
        case '\x7f':
        case '\b':
          if (this.cursor > 0) {
            this.buf = this.buf.slice(0, this.cursor - 1) + this.buf.slice(this.cursor)
            this.cursor--
            this._out('\x08 \x08')
          }
          break
        default:
          break
      }
      switch (code) {
        case 3: // Ctrl+C
          if (this.buf !== '') {
            this.buf = ''
            this.cursor = 0
            this._out('^C\r\n')
            this._prompt()
          }
          break
      case 4: // Ctrl+D
        if (this.buf === '') {
          if (this.mode === 'sandbox') this._toPortfolio()
          else this._bye(true)
        }
        break
        case 21: // Ctrl+U
          if (this.buf !== '') {
            this.buf = ''
            this.cursor = 0
            this._out('\x1b[2K\r')
            this._prompt()
          }
          break
        case 12: // Ctrl+L
          this._out('\x1b[2J\x1b[H')
          this._greet()
          this._prompt()
          break
        default:
          if (code >= 32 && code !== 27) {
            this.buf = this.buf.slice(0, this.cursor) + ch + this.buf.slice(this.cursor)
            this.cursor++
            this._out(ch)
          }
          break
      }
      i++
    }
  }

  _csi(params, final) {
    switch (final) {
      case 'A':
        this._left()
        break
      case 'B':
        this._right()
        break
      case 'H':
        if (this.cursor !== 0) this._redraw(0)
        break
      case 'F':
        if (this.cursor !== this.buf.length) this._redraw(this.buf.length)
        break
      case '~':
        if (params === '3~' && this.cursor < this.buf.length) {
          this.buf = this.buf.slice(0, this.cursor) + this.buf.slice(this.cursor + 1)
          this._redraw(this.cursor)
        }
        break
      default:
        break
    }
  }

  _left() {
    if (this.cursor > 0) {
      this.cursor--
      this._out('\x1b[D')
    }
  }

  _right() {
    if (this.cursor < this.buf.length) {
      this.cursor++
      this._out('\x1b[C')
    }
  }

  _redraw(newCursor) {
    // We can't redraw the prompt (we don't know how many columns it took in
    // the client's font), so on structural edits we move to the next line,
    // reprint prompt + buffer, and put the cursor back. Slightly clunky for
    // mid-line Home/End, but always consistent.
    const back = this.buf.length - newCursor
    this._out('\x08'.repeat(this.cursor) + '\x1b[K\r\n')
    this._prompt()
    this._out(this.buf)
    if (back > 0) this._out('\x1b[' + back + 'D')
    this.cursor = newCursor
  }

  _enter() {
    const line = this.buf
    this.buf = ''
    this.cursor = 0
    this._out('\r\n')
    this._run(line.trim())
  }

  _run(line) {
    // Sandbox mode: hand the whole line to the fake shell.
    if (this.mode === 'sandbox') {
      const r = this.sandbox.run(line)
      if (r.toPortfolio) {
        this._toPortfolio()
        return
      }
      if (r.clear) {
        this._out('\x1b[2J\x1b[H')
        this._greet()
        this._prompt()
        return
      }
      if (r.text) this._out(r.text + '\r\n')
      this._prompt()
      return
    }

    if (line === '') {
      this._prompt()
      return
    }
    const [cmd] = line.split(/\s+/)

    switch (cmd.toLowerCase()) {
      case 'help':
      case '?':
        this._out(cmdHelp() + '\r\n')
        break
      case 'whoami':
        this._out(cmdWhoami() + '\r\n')
        break
      case 'about':
        this._out(cmdAbout() + '\r\n')
        break
      case 'skills':
        this._out(cmdSkills() + '\r\n')
        break
      case 'work':
      case 'projects':
        this._out(cmdWork() + '\r\n')
        break
      case 'experience':
        this._out(cmdExperience() + '\r\n')
        break
      case 'credentials':
        this._out(cmdCredentials() + '\r\n')
        break
      case 'contact':
      case 'email':
        this._out(cmdContact() + '\r\n')
        break
      case 'neofetch':
        this._out(cmdNeofetch() + '\r\n')
        break
      case 'uptime':
        this._out(cmdUptime() + '\r\n')
        break
      case 'ls':
      case 'dir':
        this._out(cmdLs() + '\r\n')
        break
      case 'pwd':
        this._out('/portfolio\r\n')
        break
      case 'clear':
      case 'cls':
        this._out('\x1b[2J\x1b[H')
        break
      case 'shell':
      case 'bash':
        this._toShell()
        return
      case 'exit':
      case 'quit':
        this._bye(false)
        return
      default:
        this._out(cmdUnknown(cmd) + '\r\n')
    }
    this._prompt()
  }

  _toShell() {
    this.sandbox = new SandboxShell()
    this.mode = 'sandbox'
    this._out(
      c.dim +
        '\r\n  dropping into the sandbox shell — a fake Linux box (no real processes, no real files)\r\n' +
        c.reset +
        '\r\n',
    )
    this._prompt()
  }

  _toPortfolio() {
    this.mode = 'portfolio'
    this.sandbox = null
    this._out(c.dim + '\r\n[signal] sandbox exited\r\n' + c.reset)
    this._prompt()
  }

  resize(cols, rows) {
    this.cols = cols || this.cols
    this.rows = rows || this.rows
    if (this.mode === 'sandbox' && this.sandbox) this.sandbox.resize(this.cols, this.rows)
  }

  _bye(sendGoodbye) {
    if (this.exited) return
    this.exited = true
    if (this.mode === 'sandbox' && this.sandbox) this.sandbox.dispose()
    if (sendGoodbye) {
      this._out(
        c.dim + '\r\n  bye — thanks for stopping by the signal.\r\n' + c.reset,
      )
    }
    try {
      this.session.exit(0)
      this.session.end()
    } catch {
      /* already closed */
    }
    if (this.onExit) this.onExit()
  }

  dispose() {
    if (this.exited) return
    this.exited = true
    if (this.mode === 'sandbox' && this.sandbox) this.sandbox.dispose()
  }
}
