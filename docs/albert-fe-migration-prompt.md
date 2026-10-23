# Architecture & Implementation Instructions: UI Kit HMR & Tailwind CSS v4 Monorepo Setup

## 1. Core Principles & Constraints

Follow these non-negotiable architectural constraints when implementing this setup:

- **C1: Package Boundary Integrity.** Never use cross-package relative paths (`../`) between host, microfrontends, or `ui-kit`. All cross-package imports must resolve through the package name (`@albert-fe/ui-kit` or `@albert-fe/ui-kit/styles/*`). Apps must never use `@source` pointing to ui-kit's directory.
- **C2: Token Authority.** `packages/ui-kit` is the sole source of truth for design tokens. Consuming applications must never declare their own root CSS variables for theme colors or border radii.
- **C3: Host-Centric Consumption.** All microfrontends are assumed to be consumed from inside the host application shell. Standalone execution (`main.tsx`) is strictly for isolated local developer convenience.
- **C4: Singleton Dependencies.** `react` and `react-dom` are strictly Module Federation singletons and must be pinned monorepo-wide using root package overrides.
- **C5: Independent Tooling & Strict TSConfig Architecture.** Every package and application owns its own build, test, and TypeScript configurations. The monorepo root contains only `package.json` (and the root Playwright configuration). For every TypeScript workspace, exactly three `tsconfig` files are allowed—no fourth tsconfig file may exist:
  1. `tsconfig.json`: Solution root containing only project references.
  2. `tsconfig.app.json`: Application/library source compilation.
  3. `tsconfig.node.json`: Tooling and configuration files (`vite.config.ts`, `vitest.config.ts`).
- **C6: Standard CSS Layer Declaration.** Every top-level stylesheet must begin with `@layer theme, base, utilities;`. Never use the `@import 'tailwindcss'` shorthand because it declares an incompatible layer order. Import individual Tailwind layers explicitly.
- **C7: Single Preflight Authority.** Microfrontend federated widgets must never include Tailwind preflight. The host application shell is the sole preflight authority at runtime.
- **C8: Scoped Component Styles.** All component-specific styles must use CSS Modules (`*.module.css`) explicitly imported by the component. Unscoped global component styles are prohibited.

---

## 2. Workspace Scope & Implementation Targets

1. **`packages/ui-kit`**: Convert from a no-op build to a compiled library using Vite library mode (`tsc -b && vite build`). Configure package exports with the `"development"` condition pointing to source for instant HMR. Split tokens into three distinct stylesheets. Remove CSS imports from the public barrel export.
2. **`apps/host`**: Migrate the host shell to TypeScript (`.tsx`/`.ts`). Configure `@module-federation/vite` host settings, inject the single preflight authority, and import ui-kit tokens.
3. **`apps/mf-causes`**: Microfrontend remote (already TypeScript). Configure `@module-federation/vite` with `bundleAllCSS: true` and CORS headers. Implement the split `widget.css` (imported in both `./Component` and `./SidebarPanel`) and `standalone.css` (imported only in `main.tsx`).
4. **`apps/exemple-components`**: Do not modify or refactor `exemple-components`.
5. **Non-Tailwind (Pure JS) Remote Pattern**: There is currently no plain JS remote in the monorepo. Section 8 provides documentation on how non-Tailwind JS remotes integrate with this architecture; do not apply this implementation to any existing application.

> **Instruction for Existing Configurations:**
> Do not delete existing configuration files or options. Merely append the new scripts, dependencies, and settings. Keep all existing Vite proxies, environment directory settings (`envDir`), i18n configurations, and test setups intact. If any direct conflict or inconsistency arises between existing settings and the requirements below, alert the user and ask for clarification before proceeding. Make sure to copy all provided code snippets in full, including comments.

---

## 3. Root Configuration (`package.json`)

Append the following scripts, devDependencies, and package overrides to the root `package.json`. Preserve all existing scripts and configurations:

```json
{
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "concurrently -k -p \"[{name}]\" -n \"host,causes\" -c \"cyan,magenta\" \"npm run dev -w apps/host\" \"npm run dev -w apps/mf-causes\"",
    "serve:dist": "concurrently -k -p \"[{name}]\" -n \"host,causes\" -c \"cyan,magenta\" \"npx http-server apps/host/dist -p 5000 --cors -c-1 --proxy http://localhost:5000?\" \"npx http-server apps/mf-causes/dist -p 5001 --cors -c-1\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "typecheck": "npm run typecheck --workspaces",
    "lint": "oxlint --deny-warnings",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "e2e": "playwright test"
  },
  "overrides": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@babel/runtime": "^8.0.7",
    "@playwright/test": "^1.64.1",
    "concurrently": "^10.0.6",
    "oxlint": "^1.88.0",
    "prettier": "^3.9.10",
    "react-refresh": "^0.19.0",
    "wait-on": "^9.5.1"
  }
}
```

Key requirements:

- `build`: Running `npm run build --workspaces` builds `packages/*` before `apps/*`. `packages/ui-kit` must build its `dist/` artifacts first because application production builds consume ui-kit through its compiled entrypoint.
- `serve:dist`: Spins up all production builds concurrently with CORS enabled and SPA fallback (`--proxy`), allowing unified shutdown via a single `Ctrl+C`.

---

## 4. Design System Package (`packages/ui-kit`)

### 4.1 `packages/ui-kit/package.json`

Replace the no-op build script with `tsc -b && vite build`. Set up the package export map:

```json
{
  "name": "@albert-fe/ui-kit",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/index.js",
  "module": "./dist/index.js",
  "types": "./dist/types/index.d.ts",
  "exports": {
    ".": {
      "development": "./src/index.ts",
      "types": "./dist/types/index.d.ts",
      "import": "./dist/index.js",
      "default": "./dist/index.js"
    },
    "./styles/*": "./src/styles/*"
  },
  "scripts": {
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "typecheck": "tsc -b"
  },
  "dependencies": {
    "@base-ui/react": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.47.0",
    "shadcn": "^4.22.0",
    "tailwind-merge": "^2.5.4"
  },
  "peerDependencies": {
    "react": "^18.2.0 || ^18.3.0",
    "react-dom": "^18.2.0 || ^18.3.0"
  },
  "devDependencies": {
    "@tailwindcss/cli": "^4.3.3",
    "@tailwindcss/vite": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^14.3.1",
    "@types/node": "^22.9.0",
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "jsdom": "^25.0.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "tailwindcss": "^4.0.0",
    "typescript": "~6.0.3",
    "vite": "^5.4.21",
    "vitest": "^2.1.8"
  }
}
```

How this achieves HMR:

- During `vite dev`, consumer applications match the `"development"` export condition, resolving `@albert-fe/ui-kit` directly to `./src/index.ts`. Vite watches ui-kit source files and delivers instantaneous HMR across Module Federation boundaries without rebuilding.
- During `vite build`, applications resolve the `"import"` condition pointing to `./dist/index.js`.
- `./styles/*` exports point directly to raw CSS in `./src/styles/*`, allowing consuming Vite compilers to process Tailwind directives natively.

### 4.2 `packages/ui-kit/vite.config.ts`

```ts
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
```

### 4.3 `packages/ui-kit/src/utils/cn.ts`

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// obs - we really do need these to be registered at __getReactRefreshIgnoredExports, otherwise the refresh will refresh
//  the whole page. (manually verified)
declare global {
  interface Window {
    __getReactRefreshIgnoredExports?: (ctx: {
      id: string
    }) => string[] | undefined
  }
}

if (typeof window !== 'undefined') {
  const prev = window.__getReactRefreshIgnoredExports
  window.__getReactRefreshIgnoredExports = (ctx) => {
    const ignored = prev ? prev(ctx) || [] : []
    return ctx.id.includes('ui-kit')
      ? [...ignored, 'cn', 'buttonVariants', 'badgeVariants']
      : ignored
  }
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

> **Note on Fast Refresh:** Non-component exports from files that also export React components must be registered with `__getReactRefreshIgnoredExports`. If omitted, React Fast Refresh invalidates the entire module boundary, forcing a full page reload and discarding application state.

### 4.4 Public Barrel Export (`packages/ui-kit/src/index.ts`)

Remove `import "./styles/base.css"` from the barrel. Tokens are injected solely by application entrypoints. Export only components, types, and utilities:

```ts
// Utility exports
export { cn } from './utils/cn'

// Component exports
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from './components/Button/Button'
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './components/Card/Card'
export { Badge, badgeVariants, type BadgeProps } from './components/Badge/Badge'
export { Tooltip, type TooltipProps } from './components/Tooltip/Tooltip'
```

### 4.5 Styling Architecture in `packages/ui-kit/src/styles/`

Delete `base.css` and redistribute its contents into three dedicated files:

#### 1. `packages/ui-kit/src/styles/albert-tokens.css`

Contains pure Albert design system custom properties extracted from the old `base.css`:

```css
/*
 * Albert team design system CSS custom properties.
 */
:root {
  --color-albert-coolgreen: #e802c6;
}
```

#### 2. `packages/ui-kit/src/styles/shadcn-tokens.css`

Contains shadcn/ui and Base UI CSS variables and the Tailwind v4 `@theme inline` mapping:

```css
/*
 * CSS variables and Tailwind v4 @theme mappings required by shadcn/ui and Base UI components.
 */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

/*
 * `inline` makes utilities emit `hsl(var(--primary))` directly instead of
 * referencing a :root-resolved `--color-primary`. Without it, overriding
 * `--primary` on a wrapper does not recolor descendants.
 */
@theme inline {
  --color-background: hsl(var(--background));
  --color-foreground: hsl(var(--foreground));
  --color-card: hsl(var(--card));
  --color-card-foreground: hsl(var(--card-foreground));
  --color-popover: hsl(var(--popover));
  --color-popover-foreground: hsl(var(--popover-foreground));
  --color-primary: hsl(var(--primary));
  --color-primary-foreground: hsl(var(--primary-foreground));
  --color-secondary: hsl(var(--secondary));
  --color-secondary-foreground: hsl(var(--secondary-foreground));
  --color-muted: hsl(var(--muted));
  --color-muted-foreground: hsl(var(--muted-foreground));
  --color-accent: hsl(var(--accent));
  --color-accent-foreground: hsl(var(--accent-foreground));
  --color-destructive: hsl(var(--destructive));
  --color-destructive-foreground: hsl(var(--destructive-foreground));
  --color-border: hsl(var(--border));
  --color-input: hsl(var(--input));
  --color-ring: hsl(var(--ring));

  --radius-lg: var(--radius);
  --radius-md: calc(var(--radius) - 2px);
  --radius-sm: calc(var(--radius) - 4px);
}
```

#### 3. `packages/ui-kit/src/styles/tailwind-config.css`

Contains pure Tailwind v4 source scanning directives:

```css
/*
 * Tailwind v4 configuration for @albert-fe/ui-kit (source scanning, etc.),
 * independent of shadcn/ui.
 */
@source '../components';
@source '../utils';
@source not '../**/*.test.tsx';
@source not '../**/*.test.ts';
```

Because Tailwind v4 skips `node_modules` during scanning, placing `@source` inside ui-kit's stylesheet causes consumers to automatically scan ui-kit component files relative to the stylesheet location without leaking file paths into applications.

### 4.6 TypeScript Configurations in `packages/ui-kit`

#### `packages/ui-kit/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### `packages/ui-kit/tsconfig.app.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "emitDeclarationOnly": true,
    "outDir": "./dist/types",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "paths": {
      "@src/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### `packages/ui-kit/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vitest.config.ts", "vite.config.ts"]
}
```

---

## 5. Host Application Shell (`apps/host`)

Migrate `apps/host` to TypeScript. The host owns the global preflight reset and injects all design tokens.

### 5.1 `apps/host/src/index.css`

Merge existing `styles.css` resets into this file, placed after the `@import` statements:

```css
@layer theme, base, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css' layer(utilities);

@import '@albert-fe/ui-kit/styles/tailwind-config.css';
@import '@albert-fe/ui-kit/styles/albert-tokens.css';
@import '@albert-fe/ui-kit/styles/shadcn-tokens.css';

html,
body,
#root {
  height: 100%;
  margin: 0;
  padding: 0;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue',
    Arial, sans-serif;
}
```

### 5.2 `apps/host/vite.config.ts`

Maintain existing environment loading (`loadEnv`), proxy configurations (`/api`), and `envDir`. Integrate Tailwind and Module Federation:

```ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '../../'), '')

  return {
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
        dev: {
          remoteHmr: true,
        },
        remotes: {
          mfCauses: {
            name: 'mfCauses',
            entry:
              env.VITE_MF_CAUSES_URL ||
              'http://localhost:5001/assets/remoteEntry.js',
            type: 'module',
          },
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.3.1' },
          'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
        },
      }),
    ],
  }
})
```

Why `optimizeDeps.exclude: ['@albert-fe/ui-kit']` is required: Vite pre-bundles node_modules by default. Excluding ui-kit forces Vite to evaluate its source directly via the `"development"` export condition, enabling live HMR.

### 5.3 `apps/host/src/types/remotes.d.ts`

```ts
/// <reference types="vite/client" />

declare module 'mfCauses/Component' {
  import * as React from 'react'
  const Component: React.ComponentType
  export default Component
}

declare module 'mfCauses/SidebarPanel' {
  import * as React from 'react'
  const SidebarPanel: React.ComponentType
  export default SidebarPanel
}
```

### 5.4 TypeScript Configurations in `apps/host`

#### `apps/host/tsconfig.json`

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

#### `apps/host/tsconfig.app.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "customConditions": ["development"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "paths": {
      "@src/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

#### `apps/host/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"],
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

---

## 6. Microfrontend Remote (`apps/mf-causes`)

### 6.1 `apps/mf-causes/vite.config.ts`

Maintain existing proxy and env settings. Update plugins and federation:

```ts
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
      name: 'mfCauses',
      dts: false,
      dev: {
        remoteHmr: true,
      },
      filename: 'assets/remoteEntry.js',
      bundleAllCSS: true,
      exposes: {
        './Component': './src/Component.tsx',
        './SidebarPanel': './src/SidebarPanel.tsx',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.3.1' },
        'react-dom': { singleton: true, requiredVersion: '^18.3.1' },
      },
    }),
  ],
})
```

> **CRITICAL REQUIREMENT:**
> `bundleAllCSS: true` is strictly required. Without it, `@module-federation/vite` generates an empty `cssAssetMap: {}` inside production `remoteEntry.js`, causing the browser to load zero CSS when the remote mounts in the host shell.

### 6.2 Remote Widget Stylesheet (`apps/mf-causes/src/widget.css`)

```css
@layer theme, base, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/utilities.css' layer(utilities);

@reference '@albert-fe/ui-kit/styles/tailwind-config.css';
@reference '@albert-fe/ui-kit/styles/albert-tokens.css';
@reference '@albert-fe/ui-kit/styles/shadcn-tokens.css';
```

- **No Preflight:** Omits `tailwindcss/preflight.css` so host baseline rules are preserved.
- **`@reference`:** Emits only the utility classes consumed by the remote, referencing ui-kit tokens without duplicating `:root` variable definitions.
- **Import Location:** `import './widget.css'` must be added to **both** `src/Component.tsx` and `src/SidebarPanel.tsx`. Module Federation deduplicates stylesheet links automatically.

### 6.3 Standalone Stylesheet (`apps/mf-causes/src/standalone.css`)

Used exclusively when running `mf-causes` standalone outside the host shell:

```css
@layer theme, base, utilities;
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css' layer(utilities);

@import '@albert-fe/ui-kit/styles/tailwind-config.css';
@import '@albert-fe/ui-kit/styles/albert-tokens.css';
@import '@albert-fe/ui-kit/styles/shadcn-tokens.css';
```

Imported only in `apps/mf-causes/src/main.tsx`:

```tsx
import './standalone.css'
import App from './App'
```

### 6.4 TypeScript Configuration in `apps/mf-causes`

Ensure `apps/mf-causes` strictly follows the three-file tsconfig standard (`tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`), mirroring the configuration shown for `apps/host` in Section 5.4.

---

## 7. Vitest Configuration

Configure remote module resolution in host unit tests so remote components resolve to mock files:

```ts
// apps/host/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
      'mfCauses/Component': path.resolve(
        __dirname,
        './src/test/mocks/Component.tsx',
      ),
      'mfCauses/SidebarPanel': path.resolve(
        __dirname,
        './src/test/mocks/SidebarPanel.tsx',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

---

## 8. Reference: Non-Tailwind (Pure JS + CSS Modules) Remote Architecture

This pattern demonstrates how an un-compiled, non-Tailwind microfrontend integrates cleanly into this monorepo without installing Tailwind or TypeScript. **Do not apply this to existing apps; keep as architectural documentation.**

1. **`vite.config.js`**:
   - Omits `tailwindcss()` plugin.
   - Sets `server.cors: true`, `preview.cors: true`.
   - Sets `federation({ ..., bundleAllCSS: true, exposes: { './AnalyticsWidget': './src/AnalyticsWidget.jsx' } })`.
2. **CSS Modules (`AnalyticsWidget.module.css`)**:
   - Declares `@layer theme, base, utilities;` at the top.
   - References tokens directly via CSS variables (`var(--border)`, `var(--card)`, `var(--color-albert-coolgreen)`).
   - Component imports: `import styles from './AnalyticsWidget.module.css'`.
3. **`standalone.css`**:
   - Contains only `@layer theme, base, utilities;` and basic root layout resets.
   - Consumes ui-kit primitives (e.g. `<Button>`), which inherit all styling seamlessly once mounted inside the host shell.

---

## 9. Automated Testing & Verification Checklist

Confirm that all of the following verification gates pass:

1. **Static Analysis & Unit Tests**:
   ```bash
   npm run format:check
   npm run lint
   npm run typecheck
   npm test
   ```
2. **Production Build**:
   ```bash
   npm run build
   ```
   Verify that `packages/ui-kit/dist/index.js` builds first and that `apps/host/dist/` and `apps/mf-causes/dist/assets/remoteEntry.js` are generated.
3. **End-to-End Style & MFE Specificity Testing (Playwright)**:
   Add an E2E spec in `e2e/specs/css-specificity.spec.ts` asserting that an MFE-specific Tailwind utility class (a class present in the remote widget but never used in the host shell) computes correctly when mounted in the host:
   ```ts
   test('MFE-specific Tailwind utility classes apply when running inside host', async ({
     page,
   }) => {
     await page.goto('/')
     const mfeElement = page.locator('[data-testid="causes-mfe-badge"]')
     await expect(mfeElement).toBeVisible()

     const bgColor = await mfeElement.evaluate(
       (el) => window.getComputedStyle(el).backgroundColor,
     )
     expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
   })
   ```
4. **Production Mock Deploy (`serve:dist`)**:
   ```bash
   npm run serve:dist
   ```
   Open `http://localhost:5000`:
   - Inspect browser console: zero CORS errors, zero `#RUNTIME-008` federation errors.
   - Inspect browser network panel: remote CSS files (`http://localhost:5001/assets/style-*.css`) load with HTTP 200.
   - All MFE-specific styles and ui-kit primitives display expected background colors, padding, and typography.
   - Terminate the process cleanly using a single `Ctrl+C`.
