import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // ─── CAMBIO: proxy para evitar problemas de CORS en desarrollo ───────────
    // Todas las llamadas a /api/* se redirigen al backend de FastAPI.
    // Así puedes usar "/api/..." en vez de "http://localhost:8000/api/..."
    // (opcional, pero recomendado para producción)
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  }
})
