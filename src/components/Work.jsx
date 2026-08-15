import { useCallback, useRef } from 'react'
import { projects } from '../data/content.js'

const tiltEnabled =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

function ProjectCard({ project }) {
  const ref = useRef(null)
  const frame = useRef(0)

  const onMove = useCallback((e) => {
    if (!tiltEnabled) return
    const el = ref.current
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / rect.width - 0.5
      const py = (e.clientY - rect.top) / rect.height - 0.5
      el.style.setProperty('--rx', String((-py * 6).toFixed(2)) + 'deg')
      el.style.setProperty('--ry', String((px * 8).toFixed(2)) + 'deg')
    })
  }, [])

  const onLeave = useCallback(() => {
    if (!tiltEnabled) return
    cancelAnimationFrame(frame.current)
    const el = ref.current
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
  }, [])

  return (
    <article
      ref={ref}
      className="project-card glass tilt reveal"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <span className="project-icon" aria-hidden="true">
        {project.icon}
      </span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <ul className="tag-list" aria-label="Technologies and context">
        {project.tags.map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  )
}

export default function Work() {
  return (
    <section id="work" className="section">
      <div className="container">
        <header className="section-head reveal">
          <p className="eyebrow">Selected work</p>
          <h2>Research and applied systems</h2>
          <p className="section-sub">
            A selection of academic work and applied engineering themes from my experience.
          </p>
        </header>

        <div className="work-grid" data-stagger>
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  )
}