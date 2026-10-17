import http from 'node:http'
import os from 'node:os'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(here, '..')
const mode = process.argv[2] || 'all'

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function lan() {
  try {
    for (const ifaces of Object.values(os.networkInterfaces())) {
      for (const i of ifaces || []) {
        if (i.family === 'IPv4' && !i.internal) return i.address
      }
    }
  } catch {
    /* ignore */
  }
  return '0.0.0.0'
}

// Ensure the site is built so the web server has something to serve.
const dist = path.join(root, 'dist')
if (!existsSync(path.join(dist, 'index.html'))) {
  console.log('[start] dist/ not built — running `npm run build`…')
  const r = spawnSync('npm', ['run', 'build'], { cwd: root, stdio: 'inherit', shell: true })
  if (r.status !== 0) {
    console.error('[start] build failed — SSH still starts, but run `npm run build` for the web version.')
  }
}

// Serve the built site.
//
// Two extra routes, both needed so ANY visitor can ssh in:
//   /signal-config.json — runtime config (public host + ports). Fetched by the
//     site at load time so the connect instructions work even when the public
//     host changes (e.g. a new Tailscale Funnel URL) without rebuilding.
//   /guest_ed25519      — the guest private key. Deliberately public: the SSH
//     server is a sandbox (no real files/processes/network), so the key is a
//     ticket, not a secret. See ssh/sandbox-shell.mjs.
const guestKeyPath = path.join(here, 'keys', 'guest_ed25519')
const PUBLIC_HOST = process.env.PUBLIC_HOST || '' // e.g. a Tailscale Funnel host
const PUBLIC_SSH_PORT = Number(process.env.PUBLIC_SSH_PORT || 0) || null

function publicConfig() {
  return JSON.stringify({
    publicHost: PUBLIC_HOST || null,
    publicSshPort: PUBLIC_SSH_PORT,
    sshUser: 'guest',
  }, null, 2)
}

const server = http.createServer((req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)

    if (urlPath === '/signal-config.json') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
      return res.end(publicConfig())
    }

    if (urlPath === '/guest_ed25519') {
      if (!existsSync(guestKeyPath)) {
        res.writeHead(500)
        return res.end('key not found — run `npm run gen:keys`')
      }
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' })
      return res.end(readFileSync(guestKeyPath))
    }

    if (urlPath === '/') urlPath = '/index.html'
    const filePath = path.normalize(path.join(dist, urlPath))
    if (!filePath.startsWith(dist)) {
      res.writeHead(403)
      return res.end('forbidden')
    }
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
      res.end(readFileSync(filePath))
    } else if (existsSync(path.join(dist, 'index.html'))) {
      // SPA-ish fallback: this is a one-page app.
      res.writeHead(200, { 'Content-Type': MIME['.html'] })
      res.end(readFileSync(path.join(dist, 'index.html')))
    } else {
      res.writeHead(404)
      res.end('not built yet — run `npm run build` in portfolio-v4/')
    }
  } catch (e) {
    res.writeHead(500)
    res.end('error: ' + e.message)
  }
})

if (mode === 'web' || mode === 'all') {
  const port = Number(process.env.WEB_PORT || 4173)
  server.listen(port, '0.0.0.0', () => {
    console.log(`[start] web (built dist/) → http://localhost:${port}`)
    console.log(`[start] LAN:              http://${lan()}:${port}`)
  })
}

// SSH server (dynamic import: it self-registers and listens).
if (mode === 'ssh' || mode === 'all') {
  await import('./ssh-server.mjs')
}
