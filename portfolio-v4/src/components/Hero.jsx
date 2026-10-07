import { useEffect, useRef, useState } from 'react'
import { site } from '../data/content.js'

const BOOT_LINES = [
  { p: 'guest@signal', c: 'ssh -p 2222 ' + 'guest@localhost', cls: '' },
  { p: '', c: 'Connection established. Welcome to the signal.', cls: 'dim' },
  { p: '', c: 'Loading profile ... done', cls: 'dim' },
]

function useTypewriter(lines, speedMs, startDelayMs) {
  const [done, setDone] = useState([])
  const [current, setCurrent] = useState({ p: '', text: '' })
  const [finished, setFinished] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    let li = 0
    let ci = 0
    let cancelled = false

    const startLine = () => {
      setCurrent({ p: lines[li].p, text: '' })
      const tick = () => {
        if (cancelled) return
        ci += 1
        setCurrent({ p: lines[li].p, text: lines[li].c.slice(0, ci) })
        if (ci < lines[li].c.length) {
          timer.current = setTimeout(tick, speedMs)
        } else {
          setDone((d) => [...d, lines[li]])
          setCurrent({ p: '', text: '' })
          li += 1
          if (li < lines.length) {
            timer.current = setTimeout(startLine, 180)
          } else {
            setFinished(true)
          }
        }
      }
      tick()
    }

    timer.current = setTimeout(() => {
      if (!cancelled) startLine()
    }, startDelayMs)

    return () => {
      cancelled = true
      if (timer.current) clearTimeout(timer.current)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { done, current, finished }
}

export default function Hero() {
  const heroLines = [
    ...BOOT_LINES,
    { p: '', c: "Hi, I'm " + site.name + '.', cls: '' },
    { p: '', c: site.role, cls: 'green' },
    { p: '', c: site.tagline, cls: 'dim' },
  ]
  const { done, current, finished } = useTypewriter(heroLines, 14, 400)

  return (
    <section id="top" className="hero">
      <div className="term">
        <div className="term-titlebar">
          <span className="term-dot red" />
          <span className="term-dot yellow" />
          <span className="term-dot green" />
          <span className="term-title">
            guest@signal: ~/portfolio — v4 {site.initials.toLowerCase()}
          </span>
        </div>
        <div className="term-body" aria-live="polite">
          {done.map((l, i) => (
            <div className="term-line" key={i}>
              {l.p && <span className="p">{l.p} $ </span>}
              <span className={l.cls}>{l.c}</span>
            </div>
          ))}
          {!finished && current.p !== undefined && (
            <div className="term-line">
              {current.p && <span className="p">{current.p} $ </span>}
              <span className={heroLines[done.length]?.cls}>{current.text}</span>
              <span className="cursor-block">▌</span>
            </div>
          )}
          {finished && (
            <>
              <div className="hero-cta">
                <a href="#work" className="btn btn-primary">
                  <span className="p mono">$</span> show work
                </a>
                <a href="#contact" className="btn">
                  <span className="p mono">$</span> contact
                </a>
                <a href="#ssh" className="btn">
                  <span className="p mono">$</span> ssh in
                </a>
              </div>
              <dl className="hero-stats" data-stagger>
                {stats.map((s) => (
                  <div className="stat" key={s.label}>
                    <b>{s.value}</b> {s.label}
                  </div>
                ))}
              </dl>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
