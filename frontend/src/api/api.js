// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(), // React plugin
    ],
    base: './', // ✅ important for static deploy
    server: {
        proxy: {
            "/api": {
                target: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
                changeOrigin: true,
                secure: false,
            },
        },
    },
})