import { useEffect, useRef } from 'react'

// Desktop-only spaceship cursor with light positional easing, heading rotation,
// and a short engine trail. It never drifts, captures, or changes position
// without direct pointer input.

const TRAIL_SIZE = 14
const INTERACTIVE = 'a, button, input, textarea, select, [role="button"], label'

function shortestAngle(from, to) {
  return ((to - from + 540) % 360) - 180
}

export default function ShipCursor() {
  const shipRef = useRef(null)
  const trailRef = useRef(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const ship = shipRef.current
    const trailBox = trailRef.current
    document.body.classList.add('ship-cursor-active')

    const pool = []
    for (let i = 0; i < TRAIL_SIZE; i++) {
      const particle = document.createElement('span')
      particle.className = 'trail-p'
      trailBox.appendChild(particle)
      pool.push(particle)
    }

    let poolIndex = 0
    let angle = 0
    let raf = 0
    let seen = false
    let lastTick = performance.now()
    let lastTrail = 0

    const pos = { x: -100, y: -100 }
    const target = { x: -100, y: -100 }

    const spawnTrail = () => {
      const rad = ((angle - 90) * Math.PI) / 180
      const trailX = pos.x - Math.cos(rad) * 16
      const trailY = pos.y - Math.sin(rad) * 16
      const particle = pool[poolIndex]
      poolIndex = (poolIndex + 1) % TRAIL_SIZE

      particle.animate(
        [
          {
            opacity: 0.8,
            transform:
              'translate(' + trailX + 'px, ' + trailY + 'px) scale(1)',
          },
          {
            opacity: 0,
            transform:
              'translate(' + trailX + 'px, ' + trailY + 'px) scale(0.15)',
          },
        ],
        { duration: 550, easing: 'ease-out', fill: 'forwards' }
      )
    }

    const onMove = (event) => {
      target.x = event.clientX
      target.y = event.clientY
      ship.classList.add('on')

      if (!seen) {
        seen = true
        pos.x = target.x
        pos.y = target.y
      }
    }

    const onLeave = () => ship.classList.remove('on')
    const onEnter = () => {
      if (seen) ship.classList.add('on')
    }
    const onDown = () => ship.classList.add('down')
    const onUp = () => ship.classList.remove('down')
    const onOver = (event) => {
      if (event.target.closest?.(INTERACTIVE)) ship.classList.add('on-link')
    }
    const onOut = (event) => {
      if (event.target.closest?.(INTERACTIVE)) ship.classList.remove('on-link')
    }

    const tick = (now) => {
      const dt = Math.min(64, now - lastTick)
      const step = Math.max(0.25, dt / 16.67)
      lastTick = now

      const previousX = pos.x
      const previousY = pos.y
      const follow = 1 - Math.pow(0.78, step)
      pos.x += (target.x - pos.x) * follow
      pos.y += (target.y - pos.y) * follow

      const moveX = pos.x - previousX
      const moveY = pos.y - previousY
      const speed = Math.hypot(moveX, moveY)

      if (speed > 0.35) {
        const heading = (Math.atan2(moveY, moveX) * 180) / Math.PI + 90
        angle += shortestAngle(angle, heading) * (1 - Math.pow(0.82, step))
      }

      ship.style.transform =
        'translate(' +
        pos.x +
        'px, ' +
        pos.y +
        'px) translate(-50%, -50%) rotate(' +
        angle +
        'deg)'

      if (speed > 1.6 && seen && now - lastTrail > 34) {
        spawnTrail()
        lastTrail = now
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    document.documentElement.addEventListener('mouseenter', onEnter)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseout', onOut)

    return () => {
      cancelAnimationFrame(raf)
      document.body.classList.remove('ship-cursor-active')
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      document.documentElement.removeEventListener('mouseenter', onEnter)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseout', onOut)
      pool.forEach((particle) => particle.remove())
    }
  }, [])

  return (
    <div className="ship-cursor" aria-hidden="true">
      <div ref={trailRef} className="ship-trail" />
      <div ref={shipRef} className="ship-el">
        <svg viewBox="0 0 36 36" width="34" height="34" className="ship-svg">
          <defs>
            <linearGradient id="shipGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#dcebff" />
              <stop offset="1" stopColor="#5e8bff" />
            </linearGradient>
          </defs>
          <path
            className="ship-flame"
            d="M18 24 L21 31.5 L18 28.8 L15 31.5 Z"
            fill="#8fd8ff"
          />
          <path
            d="M18 2.5 C21.2 8.5 24 16 25 25.5 L18 21.8 L11 25.5 C12 16 14.8 8.5 18 2.5 Z"
            fill="url(#shipGrad)"
            stroke="rgba(200, 224, 255, 0.9)"
            strokeWidth="1"
          />
          <circle cx="18" cy="12.5" r="2.3" fill="#0b1225" opacity="0.85" />
        </svg>
      </div>
    </div>
  )
}