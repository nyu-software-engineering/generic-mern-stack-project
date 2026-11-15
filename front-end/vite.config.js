
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Send /api requests to the Express back-end, so pages can use relative paths.
    proxy: {
      '/api': 'http://127.0.0.1:3001',
    },
  },
})
