import { about, site, coreFocus } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function About() {
  return (
    <section id="about">
      <div className="container">
        <SectionHead id="about-head" cmd="whoami" title="About" />
        <div className="profile">
          <div className="card reveal">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="card reveal">
            <h3>
              <span className="icon" aria-hidden="true">
                ▸
              </span>
              profile.json
            </h3>
            <div className="keyval">
              <div className="row">
                <span className="k">name</span>
                <span className="v">{site.name}</span>
              </div>
              <div className="row">
                <span className="k">role</span>
                <span className="v">{site.role}</span>
              </div>
              <div className="row">
                <span className="k">location</span>
                <span className="v">{site.location}</span>
              </div>
              <div className="row">
                <span className="k">email</span>
                <span className="v">{site.email}</span>
              </div>
              <div className="row">
                <span className="k">phone</span>
                <span className="v">{site.phone}</span>
              </div>
              {site.socials.map((s) => (
                <div className="row" key={s.label}>
                  <span className="k">{s.label}</span>
                  <span className="v">
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.url.replace('https://', '')}
                    </a>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          {coreFocus.map((f) => (
            <div className="card reveal" key={f.name}>
              <h3>{f.name}</h3>
              <p>{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
