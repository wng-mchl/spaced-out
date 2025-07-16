// vite.config.js - Configure Vite to be accessible from network

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // Allow access from external networks (e.g., ngrok or LAN)
    port: 3000, // Your preferred dev port
    strictPort: false, // Allow fallback if port 3000 is busy
    open: true, // Optional: auto-open browser
    allowedHosts: ['.ngrok-free.app'], // Allow ngrok domains for testing
  },
  preview: {
    host: true,
    port: 4173
  }
})