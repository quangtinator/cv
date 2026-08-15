import { useEffect, useState } from 'react'
import { versions, latestVersion } from './versions.js'
import './version-switcher.css'

/**
 * Floating switcher shown on every version of the portfolio.
 * `current` is the id of the version currently on screen ('v1' | 'v2' | 'v3').
 * Styles are fully self-contained and unlayered so neither v1's global reset
 * nor v2's Tailwind preflight can bleed into it.
 */
export default function VersionSwitcher({ current }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const active = versions.find((v) => v.id === current)

  return (
    <nav
      className={'pvs' + (open ? ' pvs--open' : '')}
      aria-label="Portfolio version"
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="pvs__toggle"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="pvs-list"
      >
        <span className="pvs__dot" aria-hidden="true" />
        <span className="pvs__toggle-text">
          <span className="pvs__toggle-label">{active ? active.label : 'Version'}</span>
          <span className="pvs__toggle-name">{active ? active.name : 'Switch'}</span>
        </span>
        <span className="pvs__chevron" aria-hidden="true" />
      </button>

      <ul className="pvs__list" id="pvs-list">
        {versions.map((v) => {
          const isCurrent = v.id === current
          return (
            <li key={v.id}>
              <a
                className={'pvs__item' + (isCurrent ? ' pvs__item--current' : '')}
                href={v.href}
                aria-current={isCurrent ? 'page' : undefined}
              >
                <span className="pvs__badge">{v.label}</span>
                <span className="pvs__meta">
                  <span className="pvs__name">
                    {v.name}
                    {v.id === latestVersion && <span className="pvs__tag">latest</span>}
                  </span>
                  <span className="pvs__tagline">{v.tagline}</span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
