import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const base = process.env.VERCEL ? '/' : '/bourbon_tater/'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base,
})
