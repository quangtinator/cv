import { about } from '../data/content.js'

export default function About() {
  return (
    <section id="about" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">About</p>
          <h2>Mission briefing</h2>
        </header>

        <div className="about-grid about-grid-copy">
          <div className="about-copy reveal">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
            <ul className="about-highlights" data-stagger>
              {about.highlights.map((highlight) => (
                <li key={highlight} className="reveal">
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                    <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8Z" fill="currentColor" />
                  </svg>
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}