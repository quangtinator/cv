import { useEffect, useState } from 'react'
import SectionHead from './SectionHead.jsx'

// Runtime config (written by the server at start time): publicHost is the
// Tailscale Funnel host, publicSshPort the raw-TCP SSH port. When absent we
// are running locally (dev) and show the LAN/LAN-less hint instead.
export default function SshSection() {
  const [cfg, setCfg] = useState(null)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    let dead = false
    fetch(`${import.meta.env.BASE_URL}signal-config.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (!dead && j) setCfg(j)
      })
      .catch(() => {})
    return () => {
      dead = true
    }
  }, [])

  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(''), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  const hasPublic = cfg && cfg.publicHost
  const host = hasPublic ? cfg.publicHost : '<host>'
  const sshPort = hasPublic ? cfg.publicSshPort : 2222

  // One paste-and-go for macOS/Linux: grab the guest key, tighten perms, connect.
  const oneLiner = `curl -s https://${host}/guest_ed25519 -o ~/.ssh/signal_key && chmod 600 ~/.ssh/signal_key && ssh -i ~/.ssh/signal_key -p ${sshPort} guest@${host} -o StrictHostKeyChecking=accept-new`
  // Windows (PowerShell / cmd) can't use -o process substitution, so it's two steps.
  const winCmd = `ssh -i C:\\Users\\<you>\\signal_key -p ${sshPort} guest@${host}`

  return (
    <section id="ssh">
      <div className="container">
        <SectionHead id="ssh-head" cmd="man ssh" title="SSH in — the real deal" />
        <div className="grid-2">
          <div className="card reveal">
            <h3>
              <span className="icon" aria-hidden="true">
                ⚡
              </span>
              This portfolio runs over SSH
            </h3>
            <p style={{ marginBottom: 14 }}>
              Don&apos;t take my word for it — connect from your machine. You&apos;ll land in a
              real interactive terminal with a portfolio shell. Every command below works there,
              and <code>shell</code> drops into a sandbox shell.
            </p>
            <div className="ssh-box">
              <p className="mono" style={{ fontSize: 12, color: 'var(--text-faint)', margin: '0 0 8px' }}>
                macOS / Linux — paste this, it does everything:
              </p>
              <div className="ssh-cmd">
                <span className="p">$</span>
                <span style={{ wordBreak: 'break-all' }}>{oneLiner}</span>
                <button className="copy-btn" onClick={() => copy('one', oneLiner)} type="button">
                  {copied === 'one' ? 'copied ✓' : 'copy'}
                </button>
              </div>
              <p className="mono" style={{ fontSize: 12, color: 'var(--text-faint)', margin: '14px 0 8px' }}>
                Windows — first download the key from{' '}
                <code>https://{host}/guest_ed25519</code> to <code>C:\Users\{'<you>'}\signal_key</code>{' '}
                (no spaces), then:
              </p>
              <div className="ssh-cmd">
                <span className="p">PS&gt;</span>
                <span>{winCmd}</span>
                <button className="copy-btn" onClick={() => copy('win', winCmd)} type="button">
                  {copied === 'win' ? 'copied ✓' : 'copy'}
                </button>
              </div>
            </div>
            <p className="mono" style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 12 }}>
              It&apos;s public-key auth, but the key is public on purpose: the server is a sandbox
              with no real files, processes, or network. There&apos;s nothing to lose.
            </p>
          </div>
          <div className="card reveal">
            <h3>
              <span className="icon" aria-hidden="true">
                ?
              </span>
              Commands once you&apos;re in
            </h3>
            <div className="keyval">
              <div className="row">
                <span className="k">help</span>
                <span className="v">list everything</span>
              </div>
              <div className="row">
                <span className="k">about</span>
                <span className="v">who is this guy</span>
              </div>
              <div className="row">
                <span className="k">skills</span>
                <span className="v">tech stack</span>
              </div>
              <div className="row">
                <span className="k">work</span>
                <span className="v">projects</span>
              </div>
              <div className="row">
                <span className="k">experience</span>
                <span className="v">history</span>
              </div>
              <div className="row">
                <span className="k">credentials</span>
                <span className="v">degrees &amp; certs</span>
              </div>
              <div className="row">
                <span className="k">contact</span>
                <span className="v">email + socials</span>
              </div>
              <div className="row">
                <span className="k">shell</span>
                <span className="v">drop into the sandbox shell</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
