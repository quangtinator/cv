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
│  guest@signal:portfolio$ shell   ← drops into real bash │
└─────────────────────────────────────────────────────────┘
```

Both the web app and the SSH shell read the **same** `content.json`, so there
is one source of truth for your profile.

## What it is

| Piece | What it does |
| ----- | ------------ |
| Web app (`src/`) | React + Vite. Terminal theme (CRT scanlines, phosphor green), a fake terminal window that types your intro, section-per-command layout. |
| SSH server (`ssh/ssh-server.mjs`) | Node + `ssh2`. Listens on **port 2222**, publickey auth, offers the portfolio REPL. One-shot commands work too: `ssh ... skills`. |
| Portfolio REPL (`ssh/repl.mjs`) | The interactive `guest@signal:portfolio$` shell with `help/about/skills/work/...`. `shell` drops into real bash; `exit` there comes back. |
| Bash passthrough (`ssh/pty.mjs`) | Drives a real bash (Git Bash on Windows, `/bin/bash` elsewhere) over pipes. |

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

runs an in-process end-to-end test (ssh2 client → portfolio REPL → real bash
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
| `shell` | drop into a real bash session |
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
  No passwords. To add another visitor, append their public key line to
  `authorized_keys` and restart.
- **Host key** is `ssh/keys/host_ed25519`. Visitors pin its fingerprint on
  first connect — keep that file stable.
- **Interactive shell** is a pipe to bash (no PTY on Windows). bash in
  dumb-terminal mode does its own echo, prompt, and line editing, so the
  server is a faithful passthrough. Full-screen TUI programs (vi, top) are
  not supported for that reason; normal command use works fine.
- **One-shot exec** (`ssh host <cmd>`) runs the command as a portfolio
  command and exits — handy for scripts and CI.

## Notes / trade-offs

- `ssh2`'s native crypto binding is optional; without a C toolchain it falls
  back to pure JS. Fine for a portfolio server (few concurrent clients).
- The SSH shell's `shell` mode is a **shared, read-mostly bash** for guests.
  Anyone who can SSH in can run commands on this machine. That is the point
  of the piece, but keep the guest key private — treat it like a password.
- v1–v3 still live in the parent repo and on GitHub Pages; this folder is
  self-contained and does not touch them.
