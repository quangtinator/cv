import { useState } from 'react'
import { site } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <section id="contact">
      <div className="container">
        <SectionHead id="contact-head" cmd="ping {site.initials.toLowerCase()}" title="Contact" />
        <div className="grid-2">
          <div className="card reveal">
            <h3>Get in touch</h3>
            <p style={{ marginBottom: 14 }}>
              For projects, jobs, or a good technical conversation — my inbox is always listening.
            </p>
            <div className="ssh-box">
              <div className="ssh-cmd">
                <span className="p">guest@signal $</span>
                <span>echo {site.email}</span>
                <button className="copy-btn" onClick={copy} type="button">
                  {copied ? 'copied ✓' : 'copy'}
                </button>
              </div>
              <div className="ssh-cmd">
                <span className="p">guest@signal $</span>
                <span>{site.phone}</span>
              </div>
              <div className="ssh-cmd">
                <span className="p">guest@signal $</span>
                <span>{site.location}</span>
              </div>
            </div>
          </div>
          <div className="card reveal">
            <h3>
              <span className="icon" aria-hidden="true">
                ↗
              </span>
              Elsewhere
            </h3>
            <div className="ssh-box">
              {site.socials.map((s) => (
                <div className="ssh-cmd" key={s.label}>
                  <span className="p">guest@signal $</span>
                  <a href={s.url} target="_blank" rel="noreferrer">
                    {s.label} → {s.url.replace('https://', '')}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
