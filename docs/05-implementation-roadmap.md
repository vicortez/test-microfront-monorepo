# Implementation Roadmap & First Steps

> **Purpose:** Detailed step-by-step execution roadmap to scaffold the monorepo, configure TypeScript, absolute imports (`@src/*`), standalone package boundaries (`@albert-fe/ui-kit`), CSS token authority, Oxlint, Prettier, Module Federation, and end-to-end validation.
>
> **Core Architectural Rule:** Apps and packages are completely separate and self-contained. **No common configuration files exist other than the root-level `package.json`.**
>
> **Guideline Adherence (`docs/agents.md`):** Always use native terminal commands (`npm init`, `npm install`, etc.) when available rather than manual file creation where appropriate.

---

## 1. Phased Execution Roadmap

### Phase 1: Monorepo Foundation & Tooling Setup

1. **Initialize Root Package**:
   - Run `npm init -y` at the repo root.
   - Configure `"workspaces": ["packages/*", "apps/*"]` in root `package.json`.
   - Embed Prettier configuration directly inside root `package.json`:
     ```json
     "prettier": {
       "singleQuote": true,
       "semi": false
     }
     ```
   - Install root dev dependencies:
     ```bash
     npm install -D oxlint prettier concurrently wait-on @playwright/test
     ```
   - Add root orchestrator scripts:
     ```json
     "scripts": {
       "dev": "concurrently -k -p \"[{name}]\" -n \"host,dashboard,chat\" -c \"cyan,magenta,yellow\" \"npm run dev -w apps/host\" \"npm run dev -w apps/mf-dashboard\" \"npm run dev -w apps/mf-chat\"",
       "build": "npm run build --workspaces",
       "test": "npm run test --workspaces",
       "typecheck": "npm run typecheck --workspaces",
       "lint": "oxlint --deny-warnings",
       "format": "prettier --write .",
       "format:check": "prettier --check .",
       "e2e": "playwright test"
     }
     ```
2. **Root Infrastructure**:
   - Create root `.gitignore`.
   - Initialize Playwright configuration (`playwright.config.ts`).
   - _(Note: No `tsconfig.base.json` or shared configs are created at the root)._

---

### Phase 2: Design System Package (`packages/ui-kit`)

1. **Scaffold Package**:
   - Initialize package via `npm init -w packages/ui-kit -y`.
   - Set `"name": "@albert-fe/ui-kit"`.
   - Configure formal package `exports`:
     ```json
     "exports": {
       ".": "./src/index.ts",
       "./styles/*": "./src/styles/*"
     }
     ```
2. **Install Package Dependencies**:
   - Runtime: `@base-ui-components/react`, `clsx`, `tailwind-merge`, `class-variance-authority`, `lucide-react`.
   - Peer dependencies: `react: ^18.2.0 || ^18.3.0`, `react-dom: ^18.2.0 || ^18.3.0`.
   - Dev dependencies: `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@tailwindcss/vite`, `tailwindcss`.
3. **Independent Package Configurations**:
   - Create self-contained `packages/ui-kit/tsconfig.json` with `"paths": { "@src/*": ["./src/*"] }`.
   - Create self-contained `packages/ui-kit/vitest.config.ts`.
4. **Establish CSS Variable Single Source of Truth**:
   - Create `src/styles/tokens.css` with canonical HSL custom properties (`--background`, `--foreground`, `--primary`, `--radius`, etc.) for light and dark modes.
   - Create `src/styles/theme.css` bridging tokens to Tailwind v4 `@theme`.
5. **Implement Core Utilities & Components**:
   - `src/utils/cn.ts`: Standard `clsx` + `tailwind-merge` helper.
   - Foundational components using Base UI primitives + shadcn patterns:
     - `Button.tsx` (using `class-variance-authority`)
     - `Card.tsx` (Card, CardHeader, CardTitle, CardContent)
     - `Badge.tsx`
     - `Tooltip.tsx` (using `@base-ui-components/react/tooltip`)
   - Re-export everything from `src/index.ts`.
   - Author isolated unit & specificity tests (`cn.test.ts`, `Button.test.tsx`).

---

### Phase 3: Remote Microfrontends (`apps/mf-dashboard` & `apps/mf-chat`)

1. **Scaffold Remote 1 (`apps/mf-dashboard`)**:
   - Initialize via native npm in `apps/mf-dashboard`.
   - Port: `5001`.
   - Self-contained `tsconfig.json`, `package.json`, and `vitest.config.ts`.
   - Install React 18, React DOM 18, `@albert-fe/ui-kit` (workspace dependency).
   - Configure `vite.config.ts`:
     - `@tailwindcss/vite`
     - `@module-federation/vite` exposing `./DashboardWidget` (`filename: assets/remoteEntry.js`)
     - `@src` path alias (`path.resolve(__dirname, './src')`)
     - Shared singletons: `react` and `react-dom` (`^18.3.1`)
   - Configure `src/index.css`:
     - `@import "tailwindcss/utilities";` (safe from preflight collisions)
     - `@import "@albert-fe/ui-kit/styles/tokens.css";`
     - `@source "../../../packages/ui-kit/src";`
   - Implement simple `DashboardWidget.tsx` displaying KPI metrics, badges, and Base UI tooltip.
2. **Scaffold Remote 2 (`apps/mf-chat`)**:
   - Initialize via native npm in `apps/mf-chat`.
   - Port: `5002`.
   - Self-contained `tsconfig.json`, `package.json`, and `vitest.config.ts`.
   - Same `@module-federation/vite` setup exposing `./ChatWidget`.
   - Implement simple `ChatWidget.tsx` displaying a message feed and send input.

---

### Phase 4: Host Application Shell (`apps/host`)

1. **Scaffold Host App**:
   - Initialize via native npm in `apps/host`.
   - Port: `5000`.
   - Self-contained `tsconfig.json`, `package.json`, and `vitest.config.ts`.
   - Dependencies: `react`, `react-dom` (React 18), `react-router-dom` (`^6.28.0`), `@albert-fe/ui-kit`.
2. **Configure Vite & Module Federation**:
   - Consumes `mfDashboard` (`http://localhost:5001/assets/remoteEntry.js`) and `mfChat` (`http://localhost:5002/assets/remoteEntry.js`).
   - Shared singletons for `react` and `react-dom`.
   - `@src` path alias.
3. **Configure Tailwind & Styling**:
   - `src/index.css`: Injects `@import "tailwindcss";` (owning the single preflight authority) and `@import "@albert-fe/ui-kit/styles/tokens.css";`.
   - `@source "../../../packages/ui-kit/src";`.
4. **Build Shell Layout**:
   - Navigation Header and Sidebar.
   - Interactive **A/B Theme & Specificity Switcher** in the sidebar.
   - Main Canvas mounting **BOTH `mf-dashboard` and `mf-chat` concurrently on the same page**.

---

### Phase 5: Automated Testing & Verification

1. **Vitest Unit & Specificity Suites**:
   - `npm test` runs across all workspaces in `jsdom`.
2. **Playwright Integration & CSS Specificity Suites (`e2e/specs/`)**:
   - `multi-mfe-coexistence.spec.ts`: Confirms single-page co-existence of Host + Remote 1 + Remote 2 with zero console errors.
   - `css-specificity.spec.ts`: Confirms computed styles (`window.getComputedStyle`) match design tokens across MFE boundaries.
   - `ab-style-toggle.spec.ts`: Confirms dynamic runtime class switching and specificity overrides.
3. **Quality Gates**:
   - `npm run lint` (Oxlint)
   - `npm run format:check` (Prettier)
   - `npm run typecheck` (`npm run typecheck --workspaces`)
   - `npm run build`
   - `npm run e2e`

---

## 2. Immediate First Action

Run native terminal commands to initialize the root workspace manifest, install root tooling (`oxlint`, `prettier`, `concurrently`, `wait-on`, `@playwright/test`), configure root scripts and Prettier rules in `package.json`, and proceed with isolated package setup.
