import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import pkg from './package.json' with { type: 'json' }

// Everything the consumer installs (deps + peers) stays external, so React and
// friends are resolved once by the consuming app / Module Federation share scope.
const externalPackages = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]
const isExternal = (id: string) =>
  externalPackages.some((name) => id === name || id.startsWith(`${name}/`))

export default defineConfig({
  plugins: [react()],
  build: {
    // dist also holds the CSS + .d.ts outputs from other tools; the build
    // script cleans it once up-front so watch mode can't wipe them.
    emptyOutDir: false,
    sourcemap: true,
    minify: false,
    target: 'es2020',
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es'],
      fileName: 'index',
    },
    rollupOptions: {
      external: isExternal,
      output: { preserveModules: false },
    },
  },
})
