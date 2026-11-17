import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// BASE_PATH: "/" for Vercel (default). For GitHub Pages set BASE_PATH=/africa-stablecoin-monitor/
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { fs: { allow: ['..'] } }, // lets pages import ../METHOD.md and ../reports/*.md
})
