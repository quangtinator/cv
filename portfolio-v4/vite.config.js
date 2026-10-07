import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const page = (file) => fileURLToPath(new URL(file, import.meta.url))

export default defineConfig(({ command }) => ({
  // When built for a GitHub Pages project site (repo named "cv"), the site
  // lives under /cv/. Dev serves from /.
  base: '/',
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: page('./index.html'),
      },
    },
  },
}))
