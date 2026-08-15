import { experience } from '../data/content.js'

export default function Experience() {
  return (
    <section id="experience" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Experience</p>
          <h2>Flight log</h2>
        </header>

        <ol className="timeline">
          {experience.map((job) => (
            <li key={job.period} className="timeline-item reveal">
              <span className="timeline-node" aria-hidden="true" />
              <div className="timeline-card glass">
                <p className="timeline-period">{job.period}</p>
                <h3>
                  {job.role} <span className="timeline-company">· {job.company}</span>
                </h3>
                <p>{job.description}</p>
                <ul className="tag-list">
                  {job.tags.map((t) => (
                    <li key={t} className="chip">
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
