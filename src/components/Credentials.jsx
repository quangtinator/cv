import { certifications, education, languages, publication } from '../data/content.js'

export default function Credentials() {
  return (
    <section id="credentials" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Credentials</p>
          <h2>Beyond the code</h2>
          <p className="section-sub">
            Academic foundations, certifications, research, and the languages I bring to a team.
          </p>
        </header>

        <div className="credentials-grid">
          <section className="credential-panel glass reveal">
            <h3>Education</h3>
            <ol className="credential-list">
              {education.map((item) => (
                <li key={item.degree}>
                  <p className="credential-period">{item.period}</p>
                  <h4>{item.degree}</h4>
                  <p className="credential-institution">{item.institution}</p>
                  <p>{item.details}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="credential-panel glass reveal">
            <h3>Certifications</h3>
            <ul className="certification-list">
              {certifications.map((item) => (
                <li key={item.name}>
                  <span className="credential-mark" aria-hidden="true">+</span>
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.issuer} - {item.year}</p>
                  </div>
                </li>
              ))}
            </ul>

            <h3 className="credential-subhead">Languages</h3>
            <ul className="language-list">
              {languages.map((language) => (
                <li key={language.name}>
                  <span>{language.name}</span>
                  <span>{language.level}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <article className="publication-panel glass reveal">
          <p className="eyebrow">Publication</p>
          <h3>{publication.title}</h3>
          <p>{publication.authors} ({publication.year}). {publication.venue}</p>
        </article>
      </div>
    </section>
  )
}