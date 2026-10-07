import { experience } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function Experience() {
  return (
    <section id="experience">
      <div className="container">
        <SectionHead id="experience-head" cmd="history --format=full" title="Experience" />
        <div className="timeline">
          {experience.map((e) => (
            <div className="tl-item reveal" key={e.company + e.period}>
              <div className="tl-period">{e.period}</div>
              <div className="card tl-body">
                <h3>{e.role}</h3>
                <div className="co">{e.company}</div>
                <p>{e.description}</p>
                <div className="meta">
                  {e.tags.map((t) => (
                    <span className="tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
