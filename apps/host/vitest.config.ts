import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      'mfDashboard/DashboardWidget': path.resolve(
        __dirname,
        './src/test/mocks/DashboardWidget.tsx',
      ),
      'mfChat/ChatWidget': path.resolve(
        __dirname,
        './src/test/mocks/ChatWidget.tsx',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
