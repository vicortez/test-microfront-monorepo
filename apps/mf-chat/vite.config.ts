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
    port: 5002,
    strictPort: true,
    origin: 'http://localhost:5002',
    cors: true,
  },
  preview: {
    port: 5002,
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
      name: 'mfChat',
      dts: false,
      dev: {
        remoteHmr: true,
      },
      filename: 'assets/remoteEntry.js',
      bundleAllCSS: true,
      exposes: {
        './ChatWidget': './src/ChatWidget.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
})
