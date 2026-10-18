import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig({
  server: {
    port: 5003,
    strictPort: true,
    origin: 'http://localhost:5003',
    cors: true,
  },
  preview: {
    port: 5003,
    strictPort: true,
    cors: true,
  },
  optimizeDeps: {
    exclude: ['@albert-fe/ui-kit'],
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
  plugins: [
    react(),
    federation({
      name: 'mfAnalytics',
      dts: false,
      dev: {
        remoteHmr: true,
      },
      filename: 'assets/remoteEntry.js',
      exposes: {
        './AnalyticsWidget': './src/AnalyticsWidget.jsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
})
