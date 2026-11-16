import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { lanternPwa } from './vite/lanternPwa.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const API_URL = process.env.GRAVECAST_API ?? 'http://localhost:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), lanternPwa()],
  resolve: {
    // The specific path comes first, or 'groove-ui' would swallow it.
    alias: [
      { find: 'groove-ui/signal', replacement: path.resolve(__dirname, '../../packages/grave-ui/src/signal/index.ts') },
      { find: 'groove-ui/doodle', replacement: path.resolve(__dirname, '../../packages/grave-ui/src/components/effects/Doodle/index.ts') },
      { find: /^groove-ui$/, replacement: path.resolve(__dirname, '../../packages/grave-ui/src/index.ts') },
    ],
    dedupe: ['three', '@react-three/fiber', '@react-three/drei', 'react', 'react-dom'],
  },
  server: {
    proxy: {
      // The FastAPI backend during development. Set GRAVECAST_API to point somewhere else.
      '/health': API_URL,
      '/api': API_URL,
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      // Two pages: the website, and Lantern with its own bundle.
      input: {
        main: path.resolve(__dirname, 'index.html'),
        lantern: path.resolve(__dirname, 'lantern/index.html'),
      },
      output: {
        manualChunks(id) {
          if (id.includes('three') || id.includes('@react-three')) return 'three-vendor'
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) return 'react-vendor'
        },
      },
    },
  },
})