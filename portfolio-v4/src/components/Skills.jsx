import { skillGroups } from '../data/content.js'
import SectionHead from './SectionHead.jsx'

export default function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <SectionHead id="skills-head" cmd="env | grep STACK" title="Skills" />
        <div className="grid-2">
          {skillGroups.map((g) => (
            <div className="card skill-group reveal" key={g.category}>
              <h3>
                <span className="icon" aria-hidden="true">
                  {g.icon}
                </span>
                {g.category}
              </h3>
              <div className="chips">
                {g.items.map((it) => (
                  <span className="chip" key={it}>
                    {it}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
