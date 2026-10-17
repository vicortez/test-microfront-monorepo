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
    port: 5000,
    strictPort: true,
    origin: 'http://localhost:5000',
  },
  preview: {
    port: 5000,
    strictPort: true,
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
      name: 'host',
      dts: false,
      remotes: {
        mfDashboard: {
          name: 'mfDashboard',
          entry: 'http://localhost:5001/assets/remoteEntry.js',
          type: 'module',
        },
        mfChat: {
          name: 'mfChat',
          entry: 'http://localhost:5002/assets/remoteEntry.js',
          type: 'module',
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
})
