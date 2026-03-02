import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    exclude: ['lightningcss'],
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.REACT_APP_API_URL ,
        changeOrigin: true,
        secure: false,
      },
    },
  },
});