import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// Three portfolio versions, three separate pages. Keeping them as distinct
// HTML entries means each version keeps its own global CSS (v1's reset,
// v2's Tailwind preflight, v3's space-glass theme) without ever colliding.
const page = (file) => fileURLToPath(new URL(file, import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
        v1: page('./v1.html'),
        v2: page('./v2.html'),
      },
    },
  },
})
