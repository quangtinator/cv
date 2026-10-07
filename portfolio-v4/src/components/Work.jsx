import { projects } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function Work() {
  return (
    <section id="work">
      <div className="container">
        <SectionHead id="work-head" cmd="ls ~/projects" title="Work" />
        <div className="grid-2">
          {projects.map((p) => (
            <article className="card reveal" key={p.title}>
              <h3>
                <span className="icon" aria-hidden="true">
                  {p.icon}
                </span>
                {p.title}.git
              </h3>
              <p>{p.description}</p>
              <div className="meta">
                {p.tags.map((t) => (
                  <span className="tag" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
