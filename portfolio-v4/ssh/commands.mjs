// Portfolio command → terminal text renderers.
// Same data as the web app (../content.json), rendered as colored terminal text.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

let content
try {
  content = JSON.parse(fs.readFileSync(path.join(here, '..', 'content.json'), 'utf8'))
} catch (err) {
  console.error('portfolio-v4: could not load content.json —', err.message)
  process.exit(1)
}

const NO_COLOR = process.env.NO_COLOR !== undefined
const c = {
  reset: NO_COLOR ? '' : '\x1b[0m',
  dim: NO_COLOR ? '' : '\x1b[2m',
  bold: NO_COLOR ? '' : '\x1b[1m',
  green: NO_COLOR ? '' : '\x1b[32m',
  greenBright: NO_COLOR ? '' : '\x1b[92m',
  amber: NO_COLOR ? '' : '\x1b[33m',
  cyan: NO_COLOR ? '' : '\x1b[36m',
  red: NO_COLOR ? '' : '\x1b[31m',
  blue: NO_COLOR ? '' : '\x1b[34m',
  magenta: NO_COLOR ? '' : '\x1b[35m',
}

const W = 78 // soft terminal width for wrapping boxes

function wrap(text, width) {
  const words = String(text).split(/\s+/)
  const lines = []
  let cur = ''
  for (const w of words) {
    if (!w) continue
    if (cur.length + w.length + 1 > width && cur) {
      lines.push(cur)
      cur = w
    } else {
      cur = cur ? cur + ' ' + w : w
    }
  }
  if (cur) lines.push(cur)
  return lines
}

function hr(title) {
  const line = c.dim + '─'.repeat(W) + c.reset
  if (!title) return line
  return line + '\n' + c.bold + c.green + '  ' + title + c.reset + '\n' + line
}

function kv(key, value) {
  return c.dim + '  ' + key.padEnd(14) + c.reset + ' ' + value
}

// ── Commands ───────────────────────────────────────────────────────────

export function cmdHelp() {
  const rows = [
    ['help', 'this list'],
    ['about', 'who is this guy'],
    ['skills', 'tech stack, grouped'],
    ['work', 'selected projects'],
    ['experience', 'job history'],
    ['credentials', 'degrees, certs, languages, paper'],
    ['contact', 'email, phone, socials'],
    ['neofetch', 'system + profile at a glance'],
    ['shell', 'drop into the sandbox shell'],
    ['clear', 'wipe the screen'],
    ['exit', 'end the session'],
  ]
  let out = hr('commands') + '\n'
  for (const [cmd, desc] of rows) {
    out += '  ' + c.greenBright + cmd.padEnd(13) + c.reset + c.dim + desc + '\n'
  }
  out += '\n' + c.dim + '  every section above also works in your browser:' + c.reset
  out += '\n' + c.dim + '  ssh -p 2222 guest@<host> <command>   (one-shot, e.g. ssh ... contact)'
  return out
}

export function cmdWhoami() {
  const s = content.site
  return (
    c.bold + s.name + c.reset + ' — ' + c.amber + s.role + c.reset +
    '\n' + kv('location', s.location) +
    '\n' + kv('email', s.email) +
    '\n' + kv('phone', s.phone) +
    '\n' + kv('linkedin', s.socials[0]?.url ?? 'n/a')
  )
}

export function cmdAbout() {
  let out = hr('about') + '\n'
  for (const p of content.about.paragraphs) {
    out += wrap('  ' + p, W - 2).join('\n') + '\n\n'
  }
  out += c.bold + c.cyan + '  focus' + c.reset + '\n'
  for (const h of content.about.highlights) {
    out += '    ' + c.green + '▸' + c.reset + ' ' + h + '\n'
  }
  return out
}

export function cmdSkills() {
  let out = hr('skills') + '\n'
  for (const g of content.skillGroups) {
    out += c.bold + g.category + c.reset + c.dim + '  (' + g.items.length + ')' + c.reset + '\n'
    // flow chips into lines
    let line = '    '
    for (const it of g.items) {
      const chip = it + '  '
      if (line.length + chip.length > W) {
        out += line + '\n'
        line = '    '
      }
      line += c.green + chip + c.reset
    }
    out += line + '\n\n'
  }
  return out.trimEnd()
}

export function cmdWork() {
  let out = hr('work') + '\n'
  for (const p of content.projects) {
    out += '  ' + c.amber + p.icon + c.reset + ' ' + c.bold + p.title + c.reset + '\n'
    out += wrap('    ' + p.description, W - 4).join('\n') + '\n'
    out += '    ' + c.cyan + p.tags.join(' · ') + c.reset + '\n\n'
  }
  return out.trimEnd()
}

export function cmdExperience() {
  let out = hr('experience') + '\n'
  for (const e of content.experience) {
    out += '  ' + c.amber + e.period + c.reset + '\n'
    out += '  ' + c.bold + e.role + c.reset + ' — ' + c.cyan + e.company + c.reset + '\n'
    out += wrap('    ' + e.description, W - 4).join('\n') + '\n'
    out += '    ' + c.dim + e.tags.join(' · ') + c.reset + '\n\n'
  }
  return out.trimEnd()
}

export function cmdCredentials() {
  let out = hr('credentials') + '\n'
  out += c.bold + c.cyan + '  education' + c.reset + '\n'
  for (const e of content.education) {
    out += '    ' + c.amber + e.period + c.reset + '\n'
    out += '    ' + e.degree + '\n'
    out += '    ' + c.cyan + e.institution + c.reset + '\n'
    out += wrap('    ' + e.details, W - 4).join('\n') + '\n\n'
  }
  out += c.bold + c.cyan + '  certifications' + c.reset + '\n'
  for (const cert of content.certifications) {
    out += '    ' + c.green + '▸' + c.reset + ' ' + cert.name + c.dim + '  (' + cert.issuer + ', ' + cert.year + ')' + c.reset + '\n'
  }
  out += '\n' + c.bold + c.cyan + '  languages' + c.reset + '\n'
  for (const l of content.languages) {
    out += kv(l.name, l.level) + '\n'
  }
  out += '\n' + c.bold + c.cyan + '  publication' + c.reset + '\n'
  const p = content.publication
  out += wrap('    ' + p.authors + ' (' + p.year + '). ' + p.title + '. ' + p.venue, W - 4).join('\n') + '\n'
  return out
}

export function cmdContact() {
  const s = content.site
  let out = hr('contact') + '\n'
  out += kv('email', s.email) + '\n'
  out += kv('phone', s.phone) + '\n'
  out += kv('location', s.location) + '\n'
  for (const soc of s.socials) {
    out += kv(soc.label, soc.url) + '\n'
  }
  out += '\n' + c.dim + '  or visit the web version and copy the ssh command there.'
  return out
}

export function cmdNeofetch() {
  const os = await_neofetch()
  return os
}

// neofetch needs a bit of async (uptime, platform) — keep it sync-simple.
function await_neofetch() {
  const s = content.site
  const logo = [
    '   ██╗  ██╗',
    '   ██║  ██║',
    '   ███████║',
    '   ██╚══██║',
    '   ██║  ██║',
    '   ╚═╝  ╚═╝',
  ]
  const info = [
    [c.greenBright + s.name, ''],
    [c.dim + '────────', c.dim + s.role],
    [c.cyan + 'os', ' ' + process.platform + ' (' + process.arch + ')'],
    [c.cyan + 'node', ' v' + process.versions.node],
    [c.cyan + 'uptime', ' ' + formatUptime(process.uptime()) + ' (server)'],
    [c.cyan + 'shell', ' portfolio → sandbox'],
    [c.cyan + 'version', ' portfolio v4 "The Signal"'],
  ]
  // The logo and info row counts differ; pad the shorter one so every row has
  // both an art cell and a text cell.
  const rows = Math.max(logo.length, info.length)
  const art = (i) => logo[i] || '          '
  const cell = (i) => (i < info.length ? info[i] : ['', ''])
  let out = ''
  for (let i = 0; i < rows; i++) {
    const [label, value] = cell(i)
    out += '  ' + art(i)
    if (label) out += '   ' + label + (value ? ' ' + value : '')
    out += '\n'
  }
  return out
}

function formatUptime(sec) {
  const d = Math.floor(sec / 86400)
  const h = Math.floor((sec % 86400) / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (d) return d + 'd ' + h + 'h'
  if (h) return h + 'h ' + m + 'm'
  return m + 'm'
}

export function cmdUptime() {
  return 'up ' + formatUptime(process.uptime()) + ' · node ' + process.versions.node
}

export function cmdLs() {
  return [
    c.greenBright + 'about/' + c.reset + c.dim + '  who I am',
    ' ',
    c.greenBright + 'work/' + c.reset + c.dim + '  projects',
    ' ',
    c.greenBright + 'skills/' + c.reset + c.dim + '  tech stack',
    ' ',
    c.greenBright + 'experience/' + c.reset + c.dim + '  history',
    ' ',
    c.greenBright + 'credentials/' + c.reset + c.dim + '  degrees & certs',
    ' ',
    c.greenBright + 'contact/' + c.reset + c.dim + '  reach me',
    ' ',
    c.cyan + 'shell' + c.reset + c.dim + '  → sandbox shell',
  ].join('\n')
}

export function cmdUnknown(name) {
  return (
    c.red + 'command not found: ' + name + c.reset +
    '\n' + c.dim + '  type `help` to see what works here.'
  )
}

export const BANNER = buildBanner()

function buildBanner() {
  const art = [
    '  ╔═╗╔╦╗╦ ╦╔═╗╔═╗',
    '  ╠╩╝ ║ ║ ║╠═╣║╣ ',
    '  ╩   ╩ ╚═╝╩ ╩╚═╝',
  ]
  const lines = art.map((l) => c.greenBright + c.bold + l + c.reset)
  lines.push('  ' + c.dim + 'portfolio v4 · the signal · guest session' + c.reset)
  lines.push('')
  lines.push('  ' + c.dim + 'type ' + c.reset + c.green + 'help' + c.dim + ' to list commands, or jump straight in:' + c.reset)
  lines.push('  ' + c.dim + '  about · skills · work · experience · credentials · contact · neofetch · shell' + c.reset)
  return lines.join('\n')
}

export { content, c }
