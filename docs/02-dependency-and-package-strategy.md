# Dependency & Package Management Strategy

> **Purpose:** Rigorously define and scrutinize every dependency across the monorepo, establishing exact categorizations (`dependencies`, `devDependencies`, `peerDependencies`) to avoid version conflicts, runtime bundle bloat, and Module Federation singleton violations.
>
> **Core Architectural Rule:** Apps and packages are completely separate and self-contained. **No common configuration files exist other than the root-level `package.json`.**

---

## 1. Monorepo Dependency Scrutiny & Architectural Principles

When working with **npm workspaces**, **TypeScript**, and **Vite Module Federation**, improper dependency placement can cause catastrophic failures:

1. **No Shared Config Files (Root `package.json` Only)**:
   - There is **no** `tsconfig.base.json` and **no** shared root Vite/linting configuration.
   - Each package and application owns its own standalone `tsconfig.json`, `package.json`, and build tooling.
   - Root `package.json` acts solely as workspace coordinator, running orchestrator scripts and hosting root-level dev tools (`oxlint`, `prettier`, `@playwright/test`, `concurrently`, `wait-on`).
2. **Multiple React Instances**:
   - If `packages/ui-kit` declares `react` in `dependencies`, npm may install a distinct copy inside `packages/ui-kit/node_modules/` instead of symlinking to the root/host version.
   - **Rule**: `packages/ui-kit` MUST declare `react` and `react-dom` in `peerDependencies` (and `@types/react`, `@types/react-dom`, `react`, `react-dom` in `devDependencies` for its own Vitest tests).
3. **Consuming Shared Packages as Standalone Libraries**:
   - `packages/ui-kit` defines formal package `exports`:
     ```json
     "name": "@albert-fe/ui-kit",
     "exports": {
       ".": "./src/index.ts",
       "./styles/*": "./src/styles/*"
     }
     ```
   - Consuming apps declare `"@albert-fe/ui-kit": "*"` in their `dependencies`. Code must import strictly through the package name (`import { Button } from '@albert-fe/ui-kit'`), never relative file hopping.
4. **Independent Absolute Imports**:
   - All internal imports in apps use `@src/*` mapped to `./src/*`:
   - Configured independently in each app's `tsconfig.json`: `"paths": { "@src/*": ["./src/*"] }`
   - Configured independently in each app's `vite.config.ts`: `resolve: { alias: { '@src': path.resolve(__dirname, './src') } }`

---

## 2. Root Tooling & Formatting (Embedded in Root `package.json`)

To adhere to the principle of having **no extra common config files** at the root, Prettier is configured directly inside root `package.json`:

```json
{
  "name": "test-microfront-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "prettier": {
    "singleQuote": true,
    "semi": false
  },
  "scripts": {
    "dev": "concurrently -k -p \"[{name}]\" -n \"host,dashboard,chat\" -c \"cyan,magenta,yellow\" \"npm run dev -w apps/host\" \"npm run dev -w apps/mf-dashboard\" \"npm run dev -w apps/mf-chat\"",
    "build": "npm run build --workspaces",
    "test": "npm run test --workspaces",
    "lint": "oxlint --deny-warnings",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "e2e": "playwright test"
  }
}
```

---

## 3. Package-by-Package Dependency Matrix

### 3.1 Root Manifest (`package.json`)

| Package            | Classification    | Version                    | Purpose & Scrutiny                                                     |
| :----------------- | :---------------- | :------------------------- | :--------------------------------------------------------------------- |
| `workspaces`       | Manifest Config   | `["packages/*", "apps/*"]` | Native monorepo package linking.                                       |
| `oxlint`           | `devDependencies` | `^0.15.11`                 | Ultra-fast Rust linter for monorepo validation.                        |
| `prettier`         | `devDependencies` | `^3.4.2`                   | Code formatting engine (`singleQuote: true`, `semi: false`).           |
| `@playwright/test` | `devDependencies` | `^1.48.0`                  | E2E integration runner at monorepo root.                               |
| `concurrently`     | `devDependencies` | `^9.1.0`                   | Runs Host (5000), mf-dashboard (5001), and mf-chat (5002) in dev.      |
| `wait-on`          | `devDependencies` | `^8.0.0`                   | Ensures ports 5000, 5001, and 5002 are ready before firing Playwright. |

---

### 3.2 Shared UI Kit (`packages/ui-kit/package.json`)

Self-contained design system package.

| Package                     | Classification     | Version                | Architectural Justification                                                               |
| :-------------------------- | :----------------- | :--------------------- | :---------------------------------------------------------------------------------------- |
| `react`                     | `peerDependencies` | `^18.2.0 \|\| ^18.3.0` | **CRITICAL:** UI Kit must NOT bundle React. Consuming apps supply the React 18 singleton. |
| `react-dom`                 | `peerDependencies` | `^18.2.0 \|\| ^18.3.0` | Must match `react` peer dependency.                                                       |
| `@base-ui/react`            | `dependencies`     | `^1.0.0` or latest     | Unstyled component primitives (dialog, tooltip, popover). Consumed at runtime.            |
| `clsx`                      | `dependencies`     | `^2.1.1`               | Lightweight utility for constructing conditional className strings.                       |
| `tailwind-merge`            | `dependencies`     | `^2.5.4`               | Intelligently merges Tailwind CSS classes without style conflicts.                        |
| `class-variance-authority`  | `dependencies`     | `^0.7.1`               | Manages variant-based styling (e.g. button sizes, colors) in shadcn pattern.              |
| `lucide-react`              | `dependencies`     | `^1.47.0`              | Consistent UI icon set.                                                                   |
| `typescript`                | `devDependencies`  | `^5.6.3`               | Self-contained package type checking.                                                     |
| `@types/react`              | `devDependencies`  | `^18.3.12`             | React 18 type definitions.                                                                |
| `@types/react-dom`          | `devDependencies`  | `^18.3.1`              | React DOM 18 type definitions.                                                            |
| `@types/node`               | `devDependencies`  | `^22.9.0`              | Node.js type definitions.                                                                 |
| `react`                     | `devDependencies`  | `^18.3.1`              | Required locally only for running isolated Vitest unit tests.                             |
| `react-dom`                 | `devDependencies`  | `^18.3.1`              | Required locally for Vitest with jsdom.                                                   |
| `vitest`                    | `devDependencies`  | `^2.1.8`               | Test runner for component unit tests.                                                     |
| `@testing-library/react`    | `devDependencies`  | `^14.3.1`              | React component test utilities.                                                           |
| `@testing-library/jest-dom` | `devDependencies`  | `^6.6.3`               | Matchers for DOM node inspection.                                                         |
| `jsdom`                     | `devDependencies`  | `^25.0.1`              | Headless browser DOM environment for Vitest.                                              |
| `@vitejs/plugin-react`      | `devDependencies`  | `^4.3.4`               | Vite React plugin for Vitest compilation.                                                 |
| `@tailwindcss/vite`         | `devDependencies`  | `^4.0.0`               | Tailwind CSS v4 Vite compiler.                                                            |
| `tailwindcss`               | `devDependencies`  | `^4.0.0`               | Tailwind core.                                                                            |

---

### 3.3 Host App (`apps/host/package.json`)

The Application Shell that mounts the navigation layout, providers, and Module Federation remotes.

| Package                   | Classification    | Version    | Architectural Justification                                        |
| :------------------------ | :---------------- | :--------- | :----------------------------------------------------------------- |
| `react`                   | `dependencies`    | `^18.3.1`  | Pinned React 18 runtime. Declared as Module Federation singleton.  |
| `react-dom`               | `dependencies`    | `^18.3.1`  | React 18 DOM renderer. Declared as Module Federation singleton.    |
| `react-router-dom`        | `dependencies`    | `^6.28.0`  | **PINNED:** react-router-dom v6 (not v7). Host routing authority.  |
| `@albert-fe/ui-kit`       | `dependencies`    | `*`        | Monorepo workspace design system (consumed as standalone package). |
| `clsx`                    | `dependencies`    | `^2.1.1`   | Runtime class composition.                                         |
| `tailwind-merge`          | `dependencies`    | `^2.5.4`   | Runtime Tailwind class resolution.                                 |
| `lucide-react`            | `dependencies`    | `^1.47.0`  | Shell navigation icons.                                            |
| `typescript`              | `devDependencies` | `^5.6.3`   | App type checking.                                                 |
| `@types/react`            | `devDependencies` | `^18.3.12` | React types.                                                       |
| `@types/react-dom`        | `devDependencies` | `^18.3.1`  | React DOM types.                                                   |
| `@types/node`             | `devDependencies` | `^22.9.0`  | Node types for path aliases.                                       |
| `@module-federation/vite` | `devDependencies` | `^1.1.8`   | Vite plugin that injects runtime Module Federation manifests.      |
| `vite`                    | `devDependencies` | `^5.4.11`  | Build tool and dev server.                                         |
| `@vitejs/plugin-react`    | `devDependencies` | `^4.3.4`   | React Fast Refresh and JSX transform.                              |
| `@tailwindcss/vite`       | `devDependencies` | `^4.0.0`   | Tailwind CSS v4 Vite plugin.                                       |
| `tailwindcss`             | `devDependencies` | `^4.0.0`   | Tailwind core.                                                     |
| `vitest`                  | `devDependencies` | `^2.1.8`   | Host unit/component testing.                                       |
| `@testing-library/react`  | `devDependencies` | `^14.3.1`  | Component testing.                                                 |
| `jsdom`                   | `devDependencies` | `^25.0.1`  | Vitest test DOM.                                                   |

---

### 3.4 Remote 1 (`apps/mf-dashboard/package.json`) & Remote 2 (`apps/mf-chat/package.json`)

Independently buildable, extremely lightweight microfrontends exposing widgets to the host.

| Package                   | Classification    | Version    | Architectural Justification                                   |
| :------------------------ | :---------------- | :--------- | :------------------------------------------------------------ |
| `react`                   | `dependencies`    | `^18.3.1`  | React 18 runtime (shared as singleton via Module Federation). |
| `react-dom`               | `dependencies`    | `^18.3.1`  | React DOM (shared as singleton via Module Federation).        |
| `@albert-fe/ui-kit`       | `dependencies`    | `*`        | Workspace design system (consumed as standalone package).     |
| `clsx`                    | `dependencies`    | `^2.1.1`   | Class composition.                                            |
| `tailwind-merge`          | `dependencies`    | `^2.5.4`   | Tailwind merge utility.                                       |
| `lucide-react`            | `dependencies`    | `^1.47.0`  | Simple widget icons.                                          |
| `typescript`              | `devDependencies` | `^5.6.3`   | App type checking.                                            |
| `@types/react`            | `devDependencies` | `^18.3.12` | React types.                                                  |
| `@types/react-dom`        | `devDependencies` | `^18.3.1`  | React DOM types.                                              |
| `@types/node`             | `devDependencies` | `^22.9.0`  | Node types for path aliases.                                  |
| `@module-federation/vite` | `devDependencies` | `^1.1.8`   | Exposes remote widgets.                                       |
| `vite`                    | `devDependencies` | `^5.4.11`  | Dev server & bundler.                                         |
| `@vitejs/plugin-react`    | `devDependencies` | `^4.3.4`   | React JSX & Fast Refresh.                                     |
| `@tailwindcss/vite`       | `devDependencies` | `^4.0.0`   | Tailwind CSS v4 Vite plugin.                                  |
| `tailwindcss`             | `devDependencies` | `^4.0.0`   | Tailwind core.                                                |
| `vitest`                  | `devDependencies` | `^2.1.8`   | Remote unit testing.                                          |
| `@testing-library/react`  | `devDependencies` | `^14.3.1`  | Remote testing.                                               |
| `jsdom`                   | `devDependencies` | `^25.0.1`  | DOM for testing.                                              |

---

## 4. Standalone TypeScript Configuration (Per Workspace)

Because there is **no common base config file**, each workspace includes its own complete, self-contained `tsconfig.json`.

Example: `apps/host/tsconfig.json` (and similarly for `mf-dashboard`, `mf-chat`, and `ui-kit`):

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": false,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@src/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

In `vite.config.ts`, the matching alias is configured:

```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@src': path.resolve(__dirname, './src'),
    },
  },
  // ...
})
```

Each application and package can be typechecked in isolation using `npx tsc --noEmit` from its own directory, or globally via `npm run test --workspaces`.
