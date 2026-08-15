import { useEffect } from 'react'

// Scroll-reveal for every `.reveal` element, with per-child stagger inside
// `[data-stagger]` containers. Runs once after the static page mounts.
export default function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.reveal'))

    document.querySelectorAll('[data-stagger]').forEach((parent) => {
      Array.from(parent.children).forEach((child, i) => {
        child.style.transitionDelay = `${Math.min(i * 90, 540)}ms`
      })
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )

    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
}
