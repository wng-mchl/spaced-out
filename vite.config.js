// vite.config.js - Configure Vite to be accessible from network

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '0.0.0.0',  // Listen on all network interfaces
    port: 3000,       // Set your preferred port
    strictPort: false, // Try other ports if 3000 is taken
    open: true        // Automatically open browser
  },
  preview: {
    host: '0.0.0.0',  // Also for production preview
    port: 4173
  }
})