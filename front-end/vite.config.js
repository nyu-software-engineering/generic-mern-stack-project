import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { MOCKAROO_API_KEY } = loadEnv(mode, '.', '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/mock-api': {
          target: 'https://my.api.mockaroo.com',
          changeOrigin: true,
          headers: { 'X-API-Key': MOCKAROO_API_KEY || '' },
          rewrite: (path) => path.replace(/^\/mock-api/, ''),
        },
      },
    },
  }
})
