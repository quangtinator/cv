import { education, certifications, publication, languages } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function Credentials() {
  return (
    <section id="credentials">
      <div className="container">
        <SectionHead id="credentials-head" cmd="cat credentials.txt" title="Credentials" />
        <div className="grid-2">
          <div className="card reveal">
            <h3>Education</h3>
            {education.map((e) => (
              <div key={e.degree} style={{ marginBottom: 18 }}>
                <div className="mono" style={{ fontSize: 13, color: 'var(--amber)', marginBottom: 2 }}>
                  {e.period}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14.5, color: 'var(--text)' }}>
                  {e.degree}
                </div>
                <div className="mono" style={{ fontSize: 13, color: 'var(--cyan)' }}>
                  {e.institution}
                </div>
                <p style={{ fontSize: 13.5, marginTop: 6 }}>{e.details}</p>
              </div>
            ))}
          </div>
          <div className="card reveal">
            <h3>Certifications</h3>
            {certifications.map((c) => (
              <div key={c.name} style={{ marginBottom: 14 }}>
                <div className="mono" style={{ fontSize: 14, color: 'var(--text)' }}>
                  {c.name}
                </div>
                <div className="mono" style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
                  {c.issuer} · {c.year}
                </div>
              </div>
            ))}
            <h3 style={{ marginTop: 22 }}>Languages</h3>
            <div className="keyval">
              {languages.map((l) => (
                <div className="row" key={l.name}>
                  <span className="k">{l.name}</span>
                  <span className="v">{l.level}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="card reveal" style={{ marginTop: 16 }}>
          <h3>
            <span className="icon" aria-hidden="true">
              ◈
            </span>
            Publication
          </h3>
          <p className="mono" style={{ fontSize: 13.5 }}>
            {publication.authors} ({publication.year}). {publication.title}. {publication.venue}
          </p>
        </div>
      </div>
    </section>
  )
}
