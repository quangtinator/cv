import { useState } from 'react'
import { site } from '../data/content.js'

const SOCIAL_ICONS = {
  linkedin: (
    <path d="M4.98 3.5A2.49 2.49 0 1 1 5 8.48a2.49 2.49 0 0 1-.02-4.98ZM3 9.75h4v11.5H3ZM9.5 9.75h3.83v1.57h.05c.53-1 1.84-2.07 3.78-2.07 4.04 0 4.79 2.66 4.79 6.12v5.88h-4v-5.21c0-1.24-.02-2.85-1.74-2.85-1.74 0-2 1.36-2 2.76v5.3h-3.99Z" fill="currentColor" />
  ),
}

export default function Contact() {
  const [status, setStatus] = useState('')

  const onSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = data.get('name')?.toString().trim()
    const email = data.get('email')?.toString().trim()
    const message = data.get('message')?.toString().trim()
    if (!name || !email || !message) return

    const subject = encodeURIComponent('Portfolio contact from ' + name)
    const body = encodeURIComponent(message + '\n\n- ' + name + ' (' + email + ')')
    window.location.href = 'mailto:' + site.email + '?subject=' + subject + '&body=' + body
    setStatus('Your email app is opening with the message ready to send.')
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Contact</p>
          <h2>Open a channel</h2>
          <p className="section-sub">
            Have a project in mind, a role to fill, or just want to talk shop? My inbox is
            always open.
          </p>
        </header>

        <div className="contact-grid">
          <div className="contact-info glass reveal">
            <h3>Hailing frequencies</h3>
            <a className="contact-mail" href={'mailto:' + site.email}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.4 2L12 12.6 19.6 7Z" fill="currentColor" />
              </svg>
              {site.email}
            </a>
            <a className="contact-phone" href={'tel:' + site.phone}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6.6 3.5 9.1 3c.6-.1 1.1.2 1.3.8l1.1 3.1c.2.5 0 1.1-.4 1.4l-1.5 1.2a13.5 13.5 0 0 0 5 5l1.2-1.5c.3-.4.9-.6 1.4-.4l3.1 1.1c.6.2.9.7.8 1.3l-.5 2.5c-.1.6-.6 1-1.2 1C10.2 18.5 5.5 13.8 5.5 6.6c0-.5.4-1 1.1-1.1Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {site.phone}
            </a>
            <p className="contact-location">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7Zm0 4.5A2.5 2.5 0 1 0 12 11.5 2.5 2.5 0 0 0 12 6.5Z" fill="currentColor" />
              </svg>
              {site.location}
            </p>
            <ul className="socials" aria-label="Professional profiles">
              {site.socials.map((social) => (
                <li key={social.label}>
                  <a href={social.url} aria-label={social.label} title={social.label} target="_blank" rel="noreferrer">
                    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                      {SOCIAL_ICONS[social.icon]}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <form className="contact-form glass reveal" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="cf-name">Name</label>
              <input id="cf-name" name="name" type="text" autoComplete="name" required placeholder="Your name" />
            </div>
            <div className="field">
              <label htmlFor="cf-email">Email</label>
              <input id="cf-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label htmlFor="cf-message">Message</label>
              <textarea id="cf-message" name="message" rows="5" required placeholder="Tell me about your project..." />
            </div>
            <button type="submit" className="btn btn-primary">
              Transmit message
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M3 11.5 21 3l-6.5 18-3.2-7.3ZM21 3 11.3 13.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>
            <p className="form-status" role="status" aria-live="polite">
              {status || 'Submitting opens your email app - nothing is stored on this site.'}
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}