import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // send /api requests to the Express back-end so the front-end and back-end work together
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
