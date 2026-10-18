# Architecture & Scope Validation Document

> **Project Goal:** Prototype and validate a modernized frontend architecture for the "Albert" monorepo. This validation project isolates and verifies technical compatibility between **TypeScript**, **React 18**, **react-router-dom v6**, **Vite Module Federation**, **Tailwind CSS v4**, **shadcn/ui patterns**, **Base UI primitives (`@base-ui/react`)**, **Oxlint**, **Prettier**, **Vitest**, and **Playwright**.

---

## 1. Executive Summary & Objective

The primary objective of this experiment is to construct a clean, lightweight, fully working React monorepo that proves our target frontend stack can operate harmoniously without architectural flaws, style regressions, or runtime incompatibilities.

We validate the following core architectural pillars:

1. **Completely Independent Packages & Apps**: No common configuration files exist other than the root-level `package.json`. Every application (`apps/host`, `apps/mf-dashboard`, `apps/mf-chat`) and package (`packages/ui-kit`) is 100% self-contained with its own independent `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, and `package.json`.
2. **Full TypeScript Coverage**: All packages and apps are written in TypeScript (`.ts`, `.tsx`), with self-contained, strict compiler configurations in each workspace.
3. **Standard Absolute Imports**: All internal source references use `@src/*` mapped to `./src/*` within that specific app or package (e.g. `@src/cases/usecases` or `@src/components/Widget`), eliminating relative path traversal (`../../..`).
4. **Clean Package Boundary Consumption**: Consuming apps import `@albert-fe/ui-kit` as if it were a separate published npm library (via package `exports` map and npm workspace resolution), rather than direct relative file path traversal.
5. **UI-Kit as Single Source of Truth for CSS Variables**: All design tokens (HSL variables for light/dark theme, border-radius, font metrics) originate exclusively in `packages/ui-kit/src/styles/tokens.css`.
6. **Modern Tooling & Formatting**: **Oxlint** for ultra-fast linting, and **Prettier** configured directly in root `package.json` with `{ "singleQuote": true, "semi": false }`.
7. **Concurrent Multi-MFE Single-Page Co-existence**: Host shell running two remotes (`mf-dashboard` and `mf-chat`) simultaneously in the same viewport.
8. **Tailwind CSS v4 Integration**: Zero-config `@tailwindcss/vite` in each app with `@source` package scanning and cascade-safe resets.

---

## 2. Scope Definition: In-Scope vs. Out-of-Scope

| Feature / Domain              | Original Albert Project                                             | Validation Monorepo                                   | Rationale                                                                                                                                                              |
| :---------------------------- | :------------------------------------------------------------------ | :---------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Workspace Architecture**    | Monorepo with independent packages                                  | **Strictly Independent Packages**                     | **No shared config files** (no root `tsconfig.base.json`, etc.). Root has ONLY `package.json`.                                                                         |
| **Language**                  | Plain JavaScript (`.jsx`, `.js`)                                    | **TypeScript (`.tsx`, `.ts`)**                        | Full type-safety with independent `tsconfig.json` per workspace.                                                                                                       |
| **Import Paths**              | Relative paths (`../../cases/...`)                                  | **Absolute Paths (`@src/*`)**                         | Clean, refactor-resilient imports standardized per app.                                                                                                                |
| **UI-Kit Consumption**        | Relative or ad-hoc source imports                                   | **Package-Bound Imports (`@albert-fe/ui-kit`)**       | Treats `ui-kit` as a standalone external dependency with formal `exports`.                                                                                             |
| **CSS Variables**             | Ad-hoc `base.css` + CSS Modules                                     | **UI-Kit as Token Source of Truth**                   | Centralized in `packages/ui-kit/src/styles/tokens.css` and `@theme` mappings.                                                                                          |
| **Linting & Formatting**      | Legacy ESLint config                                                | **Oxlint + Prettier (Root `package.json`)**           | Prettier configured inside root `package.json`; Oxlint run via root script.                                                                                            |
| **Authentication (Keycloak)** | Redirects to `localhost:8000` via Keycloak PKCE client              | **OUT OF SCOPE** (Stubbed / Mocked Auth Context)      | External auth server redirects add zero value to frontend bundling & CSS validation. Replaced with an in-memory/mock session provider.                                 |
| **Backend API / BFF**         | Vite proxy to `BFF_TARGET`, real endpoints for cases/permissions    | **OUT OF SCOPE** (In-memory mock data / local stores) | We only need realistic data flows to demonstrate component rendering and state updates.                                                                                |
| **Complex Domain Logic**      | Full Cases management, audit logs, regulatory filings, heavy graphs | **OUT OF SCOPE** (Intentionally simple widgets)       | Remotes are kept **focused and modular**. The sole goal is architectural validation.                                                                                   |
| **Single Page Multi-MFE**     | Host loads one MFE per route (`/app/causes`, `/app/regulatory`)     | **IN SCOPE (Enhanced)**                               | **Must demonstrate Host + 3 Microfrontends (`mf-dashboard`, `mf-chat`, and `mf-analytics`) visible on the SAME page simultaneously**, validating runtime co-existence. |
| **Module Federation**         | `@module-federation/vite` with React 18 singletons                  | **IN SCOPE**                                          | Core requirement to test runtime script and asset loading across TypeScript and vanilla JavaScript remotes.                                                            |
| **Styling Engine**            | CSS Modules + raw CSS custom properties (`base.css`)                | **IN SCOPE (Tailwind v4 + Vanilla CSS)**              | Modernized to **Tailwind CSS v4** in Host & MFE 1/2, while MFE 3 validates pure Vanilla CSS style inheritance from the shared UI Kit.                                  |
| **Component Primitives**      | Custom built-in HTML/CSS components in `ui-kit`                     | **IN SCOPE**                                          | **shadcn/ui** design patterns built on top of **`@base-ui/react`** unstyled primitives, installed independently in `ui-kit` and `mf-dashboard`.                        |
| **Automated Testing**         | Vitest for units, custom Playwright script for host                 | **IN SCOPE (Enhanced)**                               | Vitest unit tests per workspace + Playwright E2E tests with automated CSS specificity, computed style inspection, and A/B class toggle verification.                   |

---

## 3. Monorepo Topology (No Shared Config Files)

The monorepo contains **ONLY `package.json` at the root level**. No base tsconfig, no shared linting files. Every app and package is an autonomous Node package:

```
test-microfront-monorepo/
├── package.json                   # SOLE COMMON CONFIG: Workspaces, scripts, prettier settings
├── packages/
│   └── ui-kit/                    # Standalone design system (Self-contained, includes @base-ui/react & shadcn)
│       ├── package.json           # Formal "exports": { ".": "./src/index.ts", "./styles/*": "./src/styles/*" }
│       ├── tsconfig.json          # Independent tsconfig (paths: { "@src/*": ["./src/*"] })
│       ├── vitest.config.ts       # Independent vitest config
│       └── src/
│           ├── index.ts           # Public library barrel
│           └── styles/
│               ├── tokens.css     # SOURCE OF TRUTH for all CSS variables
│               └── theme.css      # Tailwind v4 @theme bridge
├── apps/
│   ├── host/                      # Application Shell (Port 5000)
│   │   ├── package.json           # Independent dependencies
│   │   ├── tsconfig.json          # Independent tsconfig (paths: { "@src/*": ["./src/*"] })
│   │   ├── vite.config.ts         # Independent vite & Module Federation config
│   │   ├── vitest.config.ts       # Independent vitest config
│   │   └── src/
│   ├── mf-dashboard/              # Remote 1: KPI widget with Base UI Tooltip & shadcn (Port 5001)
│   │   ├── package.json           # Independent dependencies (includes @base-ui/react & shadcn)
│   │   ├── tsconfig.json          # Independent tsconfig (paths: { "@src/*": ["./src/*"] })
│   │   ├── vite.config.ts         # Independent vite & Module Federation config
│   │   ├── vitest.config.ts       # Independent vitest config
│   │   └── src/
│   ├── mf-chat/                   # Remote 2: Simple Chat widget (Port 5002)
│   │   ├── package.json           # Independent dependencies
│   │   ├── tsconfig.json          # Independent tsconfig (paths: { "@src/*": ["./src/*"] })
│   │   ├── vite.config.ts         # Independent vite & Module Federation config
│   │   ├── vitest.config.ts       # Independent vitest config
│   │   └── src/
│   └── mf-analytics/              # Remote 3: Vanilla Remote (Port 5003 - Pure JS, No TS, No Tailwind)
│       ├── package.json           # Independent dependencies (Pure JS, no TS/Tailwind devDeps)
│       ├── vite.config.js         # Independent vite.config.js (exposes ./AnalyticsWidget)
│       ├── vitest.config.js       # Independent vitest.config.js
│       └── src/
│           ├── AnalyticsWidget.jsx # Consumes UI Kit <Button> with seamless host style inheritance
│           └── AnalyticsWidget.css # Pure vanilla CSS
├── e2e/                           # Root Playwright test suite (Multi-worker parallel E2E verification)
└── docs/                          # Architecture documentation & validation guides
```

---

## 4. Single-Page Multi-MFE Runtime Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│ Browser Window (http://localhost:5000)                                 │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ Host Application Shell (Port 5000)                                 │ │
│ │ - App Navigation Bar & Brand Header                                │ │
│ │ - Imports tokens from '@albert-fe/ui-kit/styles/tokens.css'        │ │
│ │ - react-router-dom v6 (Main Route Layout)                          │ │
│ │                                                                    │ │
│ │ ┌───────────────────────────┐ ┌──────────────────────────────────┐ │ │
│ │ │ Host Sidebar              │ │ Host Main Canvas Area            │ │ │
│ │ │ - Navigation Links        │ │                                  │ │ │
│ │ │ - Theme Mode Switcher     │ │ ┌──────────────────────────────┐ │ │ │
│ │ │ - Style A/B Test Controls │ │ │ Remote 1: mf-dashboard       │ │ │ │
│ │ │                           │ │ │ (Port 5001 - React + TS + TW)│ │ │ │
│ │ │                           │ │ └──────────────────────────────┘ │ │ │
│ │ │                           │ │                                  │ │ │
│ │ │                           │ │ ┌──────────────────────────────┐ │ │ │
│ │ │                           │ │ │ Remote 2: mf-chat            │ │ │ │
│ │ │                           │ │ │ (Port 5002 - React + TS + TW)│ │ │ │
│ │ │                           │ │ └──────────────────────────────┘ │ │ │
│ │ │                           │ │                                  │ │ │
│ │ │                           │ │ ┌──────────────────────────────┐ │ │ │
│ │ │                           │ │ │ Remote 3: mf-analytics       │ │ │ │
│ │ │                           │ │ │ (Port 5003 - Pure JS, No TW) │ │ │ │
│ │ │                           │ │ │ - Imports UI Kit <Button>    │ │ │ │
│ │ │                           │ │ └──────────────────────────────┘ │ │ │
│ │ └───────────────────────────┘ └──────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Key Architecture Constraints

1. **Zero Shared Config Beyond Root Manifest**:
   - No `tsconfig.base.json`. Each package/app owns its entire compiler configuration.
   - Root `package.json` only orchestrates workspaces, scripts, and root test/lint tools.
2. **Strict Version Pinning**:
   - `react`: `^18.3.1` (Singleton across Module Federation)
   - `react-dom`: `^18.3.1` (Singleton across Module Federation)
   - `react-router-dom`: `^6.28.0` (Host shell only)
3. **Absolute Imports**:
   - Every workspace independently configures `paths: { "@src/*": ["./src/*"] }` in its own `tsconfig.json` and `resolve.alias: { '@src': path.resolve(__dirname, './src') }` in its `vite.config.ts`.
4. **Package Boundary Isolation**:
   - Apps import components as `import { Button } from '@albert-fe/ui-kit'` and CSS as `import '@albert-fe/ui-kit/styles/tokens.css'`.
5. **UI-Kit as Token Source of Truth**:
   - All `--primary`, `--background`, `--foreground`, `--radius`, and semantic tokens are defined exclusively in `packages/ui-kit`. Apps never declare independent conflicting root CSS variables.
