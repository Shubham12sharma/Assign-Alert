import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // ✅ important for static deploy
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // your local backend for dev
        changeOrigin: true,
        secure: false,
      }
    }
  }
})