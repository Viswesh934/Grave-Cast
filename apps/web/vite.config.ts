import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Proxy /health and /api/* to the FastAPI backend during development.
      '/health': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
})
