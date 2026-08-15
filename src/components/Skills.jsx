import { skillGroups, coreFocus } from '../data/content.js'

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Skills</p>
          <h2>Instrument panel</h2>
          <p className="section-sub">
            A practical toolkit spanning application engineering, AI automation, cloud delivery,
            data, security, and team practice.
          </p>
        </header>

        <div className="skills-grid" data-stagger>
          {skillGroups.map((group) => (
            <div key={group.category} className="skill-card glass reveal">
              <h3>
                <span className="skill-icon" aria-hidden="true">
                  {group.icon}
                </span>
                {group.category}
              </h3>
              <ul className="tag-list">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="levels glass reveal">
          <h3>Core focus</h3>
          <ul className="focus-list">
            {coreFocus.map((focus) => (
              <li key={focus.name} className="focus-row">
                <span className="focus-name">{focus.name}</span>
                <span className="focus-detail">{focus.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}