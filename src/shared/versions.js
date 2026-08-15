/* ════════════════════════════════════════════════════════════════════════
   Portfolio versions — one entry per design, shared by all three pages.
   Each version is its own Vite page, so their global styles never collide.
   ════════════════════════════════════════════════════════════════════════ */

const base = import.meta.env.BASE_URL

export const versions = [
  {
    id: 'v1',
    label: 'V1',
    name: 'Classic',
    tagline: 'Light / dark cards, timeline, tech grid',
    href: base + 'v1.html',
  },
  {
    id: 'v2',
    label: 'V2',
    name: 'Neobrutalist',
    tagline: 'Hard shadows, bold blocks, motion',
    href: base + 'v2.html',
  },
  {
    id: 'v3',
    label: 'V3',
    name: 'Black Hole',
    tagline: 'Space glass, gravity canvas, ship cursor',
    href: base,
  },
]

export const latestVersion = 'v3'
