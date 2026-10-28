import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O front-end nunca chama o back-end diretamente: o Vite encaminha
// /api, /auth e /media para o Django (mesma origem, sem CORS no browser).
const BACKEND = process.env.BACKEND_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': BACKEND,
      '/auth': BACKEND,
      '/media': BACKEND,
    },
  },
})
