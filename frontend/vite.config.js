// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // important: ensures CSS and JS URLs are correct
  server: {
    proxy: {
      "/api": {
        target: process.env.REACT_APP_API_URL || "http://127.0.0.1:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});