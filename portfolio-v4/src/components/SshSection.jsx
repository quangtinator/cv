import { useState } from 'react'
import { site } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

const HOST_PLACEHOLDER = 'your-host'

export default function SshSection() {
  const [copied, setCopied] = useState(false)

  const sshCmd = `ssh -p 2222 guest@${HOST_PLACEHOLDER}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sshCmd)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

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
              and <code>shell</code> drops you into a normal bash session.
            </p>
            <div className="ssh-box">
              <div className="ssh-cmd">
                <span className="p">you@your-machine $</span>
                <span>{sshCmd}</span>
                <button className="copy-btn" onClick={copy} type="button">
                  {copied ? 'copied ✓' : 'copy'}
                </button>
              </div>
            </div>
            <p className="mono" style={{ fontSize: 12.5, color: 'var(--text-faint)', marginTop: 12 }}>
              Server-side setup: see <code>portfolio-v4/ssh/README-ssh.md</code> in this repo.
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
                <span className="v">tech stack, grouped</span>
              </div>
              <div className="row">
                <span className="k">work</span>
                <span className="v">selected projects</span>
              </div>
              <div className="row">
                <span className="k">experience</span>
                <span className="v">job history</span>
              </div>
              <div className="row">
                <span className="k">credentials</span>
                <span className="v">degrees, certs, paper</span>
              </div>
              <div className="row">
                <span className="k">contact</span>
                <span className="v">email + socials</span>
              </div>
              <div className="row">
                <span className="k">shell</span>
                <span className="v">drop into real bash</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
