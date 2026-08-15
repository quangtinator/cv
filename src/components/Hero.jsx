import { site, stats } from '../data/content.js'

export default function Hero() {
  return (
    <section id="top" className="hero">
      <div className="container hero-inner">
        <div className="orbit" aria-hidden="true">
          <span className="orbit-ring r1" />
          <span className="orbit-ring r2" />
          <span className="orbit-dot" />
        </div>

        <p className="eyebrow reveal">Welcome aboard</p>
        <h1 className="hero-title reveal">
          Hi, I&apos;m <span className="grad-text">{site.name}</span>
          <br />
          {site.role}
        </h1>
        <p className="hero-tagline reveal">{site.tagline}</p>

        <div className="hero-ctas reveal">
          <a href="#work" className="btn btn-primary">
            View my work
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#contact" className="btn btn-ghost">
            Get in touch
          </a>
        </div>

        <dl className="hero-stats reveal" data-stagger>
          {stats.map((s) => (
            <div key={s.label} className="stat glass">
              <dt>{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <a href="#about" className="scroll-hint" aria-label="Scroll to the About section">
        <span className="scroll-hint-track">
          <span className="scroll-hint-dot" />
        </span>
        <span className="scroll-hint-label">scroll</span>
      </a>
    </section>
  )
}
