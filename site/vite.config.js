import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH: set by the GitHub Pages workflow to /<repo-name>/ (e.g. /Africa-Stablecoin-Monitor/). Defaults to "/" for local dev.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } }, // lets pages import ../METHOD.md and ../reports/*.md
})
