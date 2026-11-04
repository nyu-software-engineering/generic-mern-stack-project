import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import jobsMockApi from './mocks/jobs-api.mjs'
import appMockApi from './mocks/app-api.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), jobsMockApi(), appMockApi()],
})

