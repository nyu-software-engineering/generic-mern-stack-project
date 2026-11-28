import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // send API requests to the Express back-end
      '/api': 'http://localhost:3000',
      // Allow image uploads to be displayed
      '/uploads': 'http://localhost:3000'
    },
  },
});
