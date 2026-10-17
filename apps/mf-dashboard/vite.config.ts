import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['@tailwindcss/oxide', '@albert-fe/ui-kit'],
  },
  server: {
    port: 5001,
    strictPort: true,
    origin: 'http://localhost:5001',
    cors: true,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
    modulePreload: false,
  },
  plugins: [
    tailwindcss(),
    react(),
    federation({
      name: 'mfDashboard',
      dts: false,
      filename: 'assets/remoteEntry.js',
      exposes: {
        './DashboardWidget': './src/DashboardWidget.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
})
