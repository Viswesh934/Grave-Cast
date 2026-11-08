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
    dedupe: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom'],
  },
  server: {
    proxy: {
      // Proxy /health and /api/* to the FastAPI backend during development.
      '/health': 'http://localhost:8000',
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    chunkSizeWarningLimit: 1200, // Increase limit for Three.js
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) {
            return 'three-vendor'
          }
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/')
          ) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
