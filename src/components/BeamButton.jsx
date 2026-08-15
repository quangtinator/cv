import { useEffect, useRef, useState } from 'react'

// "Beam me up, Scotty" — bottom-left scroll-to-top with a Star-Trek
// transporter effect: rising gold/cyan sparkles + a brief dematerialise
// flicker on the page, then a smooth ride back to the top.

const SPARKLES = 70
const COLUMNS = 7

export default function BeamButton() {
  const [visible, setVisible] = useState(false)
  const [beamAnim, setBeamAnim] = useState(false)
  const overlayRef = useRef(null)
  const beamingRef = useRef(false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setVisible(window.scrollY > 600)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const beamUp = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (beamingRef.current) return
    beamingRef.current = true
    setBeamAnim(true)

    const overlay = overlayRef.current
    const frag = document.createDocumentFragment()

    // rising transporter light columns
    for (let i = 0; i < COLUMNS; i++) {
      const b = document.createElement('span')
      b.className = 'beam-column'
      b.style.left = `${6 + Math.random() * 88}%`
      b.style.animationDelay = `${Math.random() * 220}ms`
      b.style.animationDuration = `${800 + Math.random() * 400}ms`
      frag.appendChild(b)
    }

    // shimmering sparkles that drift upward with a slight sway
    for (let i = 0; i < SPARKLES; i++) {
      const s = document.createElement('span')
      s.className = `sparkle ${Math.random() < 0.5 ? 'gold' : 'cyan'}`
      const size = 2 + Math.random() * 3.5
      s.style.width = `${size}px`
      s.style.height = `${size}px`
      s.style.left = `${Math.random() * 100}%`
      s.style.top = `${30 + Math.random() * 68}%`
      s.style.setProperty('--sx', `${(Math.random() * 80 - 40).toFixed(0)}px`)
      s.style.animationDelay = `${Math.random() * 350}ms`
      s.style.animationDuration = `${600 + Math.random() * 500}ms`
      frag.appendChild(s)
    }
    overlay.appendChild(frag)
    document.body.classList.add('beaming')

    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 350)
    setTimeout(() => {
      overlay.textContent = ''
      document.body.classList.remove('beaming')
      beamingRef.current = false
      setBeamAnim(false)
    }, 1450)
  }

  return (
    <>
      <button
        type="button"
        className={`beam-btn glass${visible ? ' show' : ''}${beamAnim ? ' beaming' : ''}`}
        onClick={beamUp}
        aria-label="Beam me up, Scotty — scroll back to top"
        tabIndex={visible ? 0 : -1}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" className="beam-icon">
          <path
            d="M12 2 L13.2 6.8 L18 8 L13.2 9.2 L12 14 L10.8 9.2 L6 8 L10.8 6.8 Z"
            fill="currentColor"
          />
          <path d="M5 19 L12 15.5 L19 19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M7 22 L12 19.5 L17 22" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
        </svg>
        <span>Beam me up, Scotty</span>
      </button>
      <div ref={overlayRef} className="beam-overlay" aria-hidden="true" />
    </>
  )
}
