# Portfolio v4 — "The Signal"

A terminal-themed portfolio with a twist: **the SSH connection itself is the
portfolio.** Browse it in a browser, or `ssh` in from your own machine and
read it from a real interactive terminal.

```text
┌─────────────────────────────────────────────────────────┐
│  guest@your-machine $ ssh -p 2222 guest@quang.host      │
│  Connection established. Welcome to the signal.         │
│  guest@signal:portfolio$ help                           │
│    about · skills · work · experience ·                 │
│    credentials · contact · neofetch · shell             │
│  guest@signal:portfolio$ shell   ← drops into a sandbox shell │
└─────────────────────────────────────────────────────────┘
```

Both the web app and the SSH shell read the **same** `content.json`, so there
is one source of truth for your profile.

## What it is

| Piece | What it does |
| ----- | ------------ |
| Web app (`src/`) | React + Vite. Terminal theme (CRT scanlines, phosphor green), a fake terminal window that types your intro, section-per-command layout. |
| SSH server (`ssh/ssh-server.mjs`) | Node + `ssh2`. Listens on **port 2222**, publickey auth, offers the portfolio REPL. One-shot commands work too: `ssh ... skills`. Adds per-IP rate limiting + auth-failure lockout for public exposure. |
| Portfolio REPL (`ssh/repl.mjs`) | The interactive `guest@signal:portfolio$` shell with `help/about/skills/work/...`. `shell` drops into the sandbox shell; `exit` there comes back. |
| Sandbox shell (`ssh/sandbox-shell.mjs`) | A fake Linux box. **No child processes, no filesystem, no network** — every command is answered from in-memory strings + the portfolio content, so the server is safe to expose publicly. |

## Quick start (this machine)

```bash
cd portfolio-v4
npm install
npm run build        # builds the web app into dist/
npm run gen:keys     # creates ssh/keys/* (host key + guest key) — run once
npm start            # starts SSH (2222) + web (4173) together
```

Then, from another machine on your network (see the LAN address it prints):

```bash
ssh -i <path-to-guest_ed25519> -p 2222 guest@<your-host>
# one-shot:
ssh -i <path-to-guest_ed25519> -p 2222 guest@<your-host> skills
```

The guest key is `ssh/keys/guest_ed25519` (private) — that's the credential
you hand to a visitor, or add to their ssh agent/config.

### Testing without another machine

```bash
npm run test:ssh
```

runs an in-process end-to-end test (ssh2 client → portfolio REPL → sandbox shell
→ back), covering the whole loop on loopback.

## Commands in the SSH shell

| Command | What it shows |
| ------- | ------------- |
| `help` | this list |
| `about` | bio + focus |
| `skills` | tech stack, grouped |
| `work` | selected projects |
| `experience` | job history |
| `credentials` | degrees, certs, languages, publication |
| `contact` | email, phone, socials |
| `neofetch` | system + profile at a glance |
| `shell` | drop into the sandbox shell (fake Linux box) |
| `clear`, `exit` | wipe / end session |

`whoami`, `ls`, `pwd`, `uptime` also work as small extras.

## Configuration

- **Content** — edit `content.json` (site info, projects, skills, experience,
  credentials). Changes apply to both the web app and the SSH shell after a
  rebuild (`npm run build` for web; the SSH shell re-reads it on server start).
- **Ports** — `PORT` (SSH, default 2222), `WEB_PORT` (web, default 4173).
- **Web subpath** — the dev server and self-hosted build serve from `/`.
  If you instead publish this app to a GitHub Pages *project* site, set
  `base` in `vite.config.js` to `/cv/` (or your repo name) and rebuild.

## How the SSH side works

- **Auth: publickey only.** The server's `authentication` handler matches the
  offered key against `ssh/keys/authorized_keys` (via `parseKey` + `verify`).
  No passwords. The guest key is **deliberately public** for public exposure:
  the web server hands it out at `/guest_ed25519`, and the website builds a
  copy-paste connect command around it. Security comes from the sandbox below,
  not from keeping the key secret.
- **Host key** is `ssh/keys/host_ed25519`. Visitors pin its fingerprint on
  first connect (the one-liner uses `StrictHostKeyChecking=accept-new`) — keep
  that file stable.
- **The `shell` command is a sandbox** (`ssh/sandbox-shell.mjs`), not a real
  shell. It answers a small fake Linux vocabulary (`ls`, `cat`, `pwd`, `cd`,
  `echo`, `whoami`, `uname`, `date`, `uptime`, `neofetch`, …) from in-memory
  data, with the portfolio content exposed as `/home/guest/*.txt`. It spawns
  no processes and reads no files, so a stranger on the internet cannot touch
  the host. `exit` returns to the portfolio menu.
- **One-shot exec** (`ssh host <cmd>`) runs the command as a portfolio
  command and exits — handy for scripts and CI.

## Public exposure (Tailscale Funnel)

The server is exposed to the public internet via **Tailscale Funnel**:

- `tailscale funnel --bg --https=443 http://localhost:4173`  → the website
- `tailscale funnel --bg --tcp=8443 tcp://localhost:2222`     → raw SSH

Funnel only allows public ports **443 / 8443 / 10000**, so SSH rides on 8443
(raw TCP forwarder — SSH is the documented use case). Set `PUBLIC_HOST` and
`PUBLIC_SSH_PORT` env vars when starting the server so the website's
connect-on-liner uses the real Funnel host (e.g.
`PUBLIC_HOST=kex-148.taile4a0a0.ts.net PUBLIC_SSH_PORT=8443`).

### Defense-in-depth for being public

1. **Sandbox shell** — the only thing a visitor can run; no files/processes/net.
2. **Publickey auth only** — no password spray; the key is public by design.
3. **Per-IP rate limiting** — max ~60 new conns/min/IP, 64 concurrent,
   and 10 auth failures in 2 min locks the IP for 10 min (loopback exempt).
   Drops and lockouts are logged with the source IP.
4. **No secrets on disk exposure** — the web server only serves `dist/`, the
   guest key, and the config JSON. Paths outside `dist/` are rejected.

## Notes / trade-offs

- `ssh2`'s native crypto binding is optional; without a C toolchain it falls
  back to pure JS. Fine for a portfolio server (few concurrent clients).
- The SSH `shell` mode is a **sandbox** — nothing a visitor runs touches the
  real machine. That is what makes public exposure safe. If you ever want a
  real shell again, that is a *private* feature: gate it by IP/tailnet, never
  expose it publicly.
- The website + SSH read the **same** `content.json`, so there is one source of
  truth for your profile.
- v1–v3 still live in the parent repo and on GitHub Pages; this folder is
  self-contained and does not touch them.
