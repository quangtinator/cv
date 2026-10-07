// Integration test: drive an interactive SSH session the way a real user
// would (ssh2 Client in shell mode, sending raw terminal input).
//   - portfolio REPL commands (help, contact, uptime)
//   - `shell` → real bash → `echo`/`pwd` → `exit` back to portfolio
// Exit code 0 only if every check passes.

import ssh2 from 'ssh2'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const { Client } = ssh2
const dir = fileURLToPath(new URL('.', import.meta.url))
const clientKey = readFileSync(dir + 'ssh/keys/guest_ed25519', 'utf8')

const results = []
let output = ''
let finished = false

function record(name, ok) {
  if (!results.some((r) => r.name === name)) results.push({ name, ok })
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name)
}

const hardTimeout = setTimeout(() => {
  if (!finished) {
    record('no hard timeout', false)
    finish(1)
  }
}, 45000)

function tail(n) {
  return output.slice(-n)
}

// state machine: each state inspects accumulated output and sends the next
// input when its precondition is met.
const states = [
  {
    name: 'banner+help',
    send: () => 'help\r',
    pass: () => output.includes('commands') && output.includes('neofetch'),
    next: 'contact',
  },
  {
    name: 'contact',
    send: () => 'contact\r',
    pass: () => output.includes('quang.phung@rwth-aachen.de'),
    next: 'shell',
  },
  {
    name: 'bash starts',
    send: () => 'shell\r',
    pass: () => output.includes('dropping into'),
    next: 'bash-echo',
  },
  {
    name: 'bash echo',
    send: () => 'echo hello-from-bash\r',
    pass: () => output.includes('hello-from-bash'),
    next: 'bash-pwd',
  },
  {
    name: 'bash pwd',
    send: () => 'pwd\r',
    pass: () => /\/c\/Users\/\S+|\/home\/\S+/.test(tail(800)),
    next: 'bash-exit',
  },
  {
    name: 'back to portfolio',
    send: () => 'exit\r',
    pass: () => output.includes('bash exited'),
    next: 'uptime',
  },
  {
    name: 'repl alive after bash',
    send: () => 'uptime\r',
    pass: () => /\bup \d+[mhd]/.test(tail(400)),
    next: null,
  },
]

let idx = 0
let sent = false
let stream = null

function tick() {
  if (finished) return
  let guard = 0
  while (idx < states.length && guard++ < 100) {
    const st = states[idx]
    if (!sent) {
      sent = true
      stream.write(st.send())
      return // wait for this input's output
    }
    if (st.pass()) {
      record(st.name, true)
      idx++
      sent = false
      // loop: send the next state's input immediately, don't wait for new data
    } else {
      return // wait for more output
    }
  }
  if (idx >= states.length) finish(0)
}

function finish(code) {
  if (finished) return
  finished = true
  clearTimeout(hardTimeout)
  console.log('\n===== results =====')
  let ok = true
  for (const r of results) {
    if (!r.ok) ok = false
    console.log((r.ok ? 'PASS' : 'FAIL') + '  ' + r.name)
  }
  if (results.length < states.length) {
    ok = false
    console.log('NOTE: reached ' + results.length + ' of ' + states.length + ' states')
  }
  console.log('\n===== raw output (tail) =====')
  console.log(tail(3000))
  try {
    stream && stream.end()
  } catch {}
  setTimeout(() => process.exit(code), 300)
}

const c = new Client()
c.on('ready', () => {
  c.shell({ term: 'xterm-256color', cols: 80, rows: 24 }, (err, s) => {
    if (err) {
      console.log('shell request failed:', err.message)
      process.exit(1)
    }
    stream = s
    stream.on('data', (d) => {
      output += d.toString('utf8')
      tick()
    })
    stream.on('close', () => finish(0))
    tick()
  })
})
c.on('error', (e) => {
  console.log('CLIENT ERROR:', e.message)
  process.exit(1)
})
c.connect({
  host: '127.0.0.1',
  port: 2222,
  username: 'guest',
  privateKey: clientKey,
  readyTimeout: 15000,
})
