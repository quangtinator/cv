# Portfolio — three versions, one app

All three portfolio designs live in this single Vite app. A floating switcher in the
bottom-left corner of every page moves between them.

| Version | Page        | Design                                          | Entry                     |
| ------- | ----------- | ----------------------------------------------- | ------------------------- |
| V1      | `/v1.html`  | Classic — light/dark theme, timeline, tech grid  | `src/versions/v1/main.jsx` |
| V2      | `/v2.html`  | Neobrutalist — hard shadows, Tailwind, motion    | `src/versions/v2/main.jsx` |
| V3      | `/`         | Black hole — space glass, canvas, ship cursor    | `src/main.jsx`             |

V3 is the default page and the newest design.

## Why separate pages

Each version brings its own global CSS: V1 has a `*` reset, V2 pulls in Tailwind's
preflight, V3 has the space-glass theme. Keeping them as three Vite HTML entries means
they are separate documents, so those globals can never collide. The trade-off is a
full page load when switching versions, which is fine for a version switcher.

Shared code lives in `src/shared/` — the switcher component and the list of versions.
To change labels, taglines or ordering, edit `src/shared/versions.js`.

## Running

```bash
npm run dev
```

Then open http://localhost:5173 (V3), `/v1.html`, or `/v2.html`.

```bash
npm run build
npm run preview
```

`npm run build` emits all three pages into `dist/`.

## Deploying

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the app and
publishes it to GitHub Pages at https://quangtinator.github.io/cv/. This needs
**Settings → Pages → Source: GitHub Actions** enabled on the repository once.

Builds use `base: '/cv/'` so a project-site subpath resolves; the dev server still
serves from `/`. If the repository is ever renamed, update `base` in
`vite.config.js` to match — the switcher builds its links from
`import.meta.env.BASE_URL`, so it follows automatically.

## Notes on the ported versions

V1 and V2 were originally a Create React App and a Next.js app. They now run on the
same React 19 + Vite toolchain as V3:

- Material-UI v4 icons (incompatible with React 19) were replaced by `react-icons`
  equivalents.
- `typewriter-effect`, `react-text-loop-next` and `react-vertical-timeline-component`
  were replaced with small local components in `src/versions/v1/lib/`.
- V2's Next.js page became a plain React component; Tailwind v4 runs through
  `@tailwindcss/vite`, and its fonts load from `v2.html`.
