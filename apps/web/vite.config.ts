import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'groove-ui': path.resolve(__dirname, '../../packages/grave-ui/src/index.ts'),
    },
  },
  server: {
    proxy: {
      // Proxy /health and /api/* to the FastAPI backend during development.
      '/health': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
})
