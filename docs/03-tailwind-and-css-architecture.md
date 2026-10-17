# Tailwind CSS v4 & Microfrontend Styling Architecture

> **Purpose:** Specify the complete styling architecture for the modernized monorepo using **Tailwind CSS v4** (`@tailwindcss/vite`), establishing **`packages/ui-kit` as the single source of truth for CSS variables**, defining cross-package consumption, `@source` scanning, and CSS specificity verification.

---

## 1. The Single Source of Truth for CSS Variables

A fundamental architectural rule of this monorepo is that **`packages/ui-kit` is the sole authority for all CSS design tokens**.

Apps (`apps/host`, `apps/mf-dashboard`, `apps/mf-chat`) **never** declare their own root CSS variables for colors, typography, or radiuses. They consume the tokens provided by the UI Kit package as a formal dependency asset:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       packages/ui-kit (Design System)                       │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ src/styles/tokens.css (SINGLE SOURCE OF TRUTH)                        │  │
│  │ :root {                                                               │  │
│  │   --background: 0 0% 100%;                                            │  │
│  │   --foreground: 222.2 84% 4.9%;                                       │  │
│  │   --primary: 221.2 83.2% 53.3%;                                       │  │
│  │   --primary-foreground: 210 40% 98%;                                  │  │
│  │   --card: 0 0% 100%;                                                  │  │
│  │   --card-foreground: 222.2 84% 4.9%;                                  │  │
│  │   --radius: 0.5rem;                                                   │  │
│  │ }                                                                     │  │
│  │ .dark {                                                               │  │
│  │   --background: 222.2 84% 4.9%;                                       │  │
│  │   --foreground: 210 40% 98%;                                          │  │
│  │   /* Dark theme token overrides */                                    │  │
│  │ }                                                                     │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
│                                      │                                      │
│  ┌───────────────────────────────────▼───────────────────────────────────┐  │
│  │ src/styles/theme.css (Tailwind v4 @theme bridge)                      │  │
│  │ @theme {                                                              │  │
│  │   --color-background: hsl(var(--background));                         │  │
│  │   --color-foreground: hsl(var(--foreground));                         │  │
│  │   --color-primary: hsl(var(--primary));                               │  │
│  │   --color-primary-foreground: hsl(var(--primary-foreground));        │  │
│  │   --color-card: hsl(var(--card));                                     │  │
│  │   --color-card-foreground: hsl(var(--card-foreground));              │  │
│  │   --radius-lg: var(--radius);                                         │  │
│  │ }                                                                     │  │
│  └───────────────────────────────────┬───────────────────────────────────┘  │
└──────────────────────────────────────┼──────────────────────────────────────┘
                                       │
                Imported as external package dependency:
                @import "@albert-fe/ui-kit/styles/tokens.css";
                @import "@albert-fe/ui-kit/styles/theme.css";
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                             Consuming Applications                          │
│                                                                             │
│  ┌──────────────────────────────┐        ┌───────────────────────────────┐  │
│  │ apps/host/src/index.css      │        │ apps/mf-*/src/index.css       │  │
│  │ @import "tailwindcss";       │        │ @import "tailwindcss/utiliti..│  │
│  │ @import "@albert-fe/ui-kit/..│        │ @import "@albert-fe/ui-kit/.. │  │
│  │ @source "../../packages/.."; │        │ @source "../../packages/..";  │  │
│  │ - Full preflight reset       │        │ - No duplicate preflight reset│  │
│  │ - Global window layout       │        │ - Scoped widget styling       │  │
│  └──────────────────────────────┘        └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Consuming UI-Kit as a Standalone Package

Instead of relative file paths, consuming apps import UI Kit styles and components as if they were published to npm:

```typescript
// Inside apps/mf-dashboard/src/DashboardWidget.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@albert-fe/ui-kit'
import { Button } from '@albert-fe/ui-kit'
import { Badge } from '@albert-fe/ui-kit'

// Inside apps/host/src/index.css
@import "tailwindcss";
@import "@albert-fe/ui-kit/styles/tokens.css";
@import "@albert-fe/ui-kit/styles/theme.css";
```

This clean package boundary ensures that apps remain decoupled from the directory structure of the monorepo.

---

## 3. Tailwind CSS v4 & Module Federation Preflight Strategy

### Principle 1: Zero-Config Vite Integration (`@tailwindcss/vite`)

Each Vite configuration simply registers the `@tailwindcss/vite` plugin:

```typescript
// vite.config.ts (in host, mf-dashboard, mf-chat)
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
  plugins: [tailwindcss(), react(), federation({/* ... */})],
})
```

### Principle 2: Cross-Workspace Scanning via `@source` Directive

To ensure that all Tailwind classes used inside `packages/ui-kit/src` are included in the generated stylesheets, each consuming app includes the `@source` directive in its CSS entry point:

```css
/* apps/host/src/index.css */
@import 'tailwindcss';
@import '@albert-fe/ui-kit/styles/tokens.css';
@import '@albert-fe/ui-kit/styles/theme.css';

/* Explicitly scan workspace package source */
@source "../../../packages/ui-kit/src";
```

### Principle 3: Single Preflight Authority (Host Shell)

- **Host Application Shell (`apps/host`)**:
  - Injects `@import "tailwindcss";`, which contains the base preflight reset.
  - Sets the global canvas background, default typography, and root CSS variables.
- **Microfrontends (`mf-dashboard`, `mf-chat`)**:
  - In production / federated mode, remotes import utility layers and design tokens (`@import "tailwindcss/utilities";` or scoped reset), preventing conflicting preflights from wiping host rules.

---

## 4. CSS Specificity & Class Clashing Mitigation

### 4.1 Class Name Conflict Resolution via `cn()`

All UI Kit components and consumer apps rely on the standard `cn()` utility:

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- When a consumer overrides a UI Kit component's padding or color (e.g. `<Button className="bg-emerald-600 px-6">`), `twMerge` eliminates the default `bg-primary` and `px-4`, preventing specificity ties in the CSS cascade.

### 4.2 Microfrontend Boundary Isolation

Each remote mounts inside a distinct DOM container:

- Host wrapper: `<section id="mfe-dashboard" data-testid="mfe-dashboard-root" className="mfe-container mfe-dashboard ...">`
- Host wrapper: `<section id="mfe-chat" data-testid="mfe-chat-root" className="mfe-container mfe-chat ...">`

---

## 5. A/B Testing & CSS Specificity Verification Strategy

We validate our styling architecture programmatically using automated tests at two levels:

### Level 1: Vitest Component-Level Specificity Tests

In `packages/ui-kit`, we test:

1. Default component classes are generated correctly.
2. Passing an override class (e.g. `className="bg-purple-600"` on a Button whose default is `bg-primary`) successfully overrides the default class via `cn()`.
3. Base UI slot classes receive correct specificity and state variants (e.g. `data-[state=open]`).

### Level 2: Playwright Live Browser A/B & Computed Style Verification

In `e2e/specs/css-specificity.spec.ts`, Playwright runs against the live, unified page:

1. **Computed Style Inspection**:
   Query DOM elements across Host, `mf-dashboard`, and `mf-chat`, using `window.getComputedStyle(el)` to inspect exact computed RGB values, paddings, and font sizes.
   ```typescript
   const dashboardCard = page.locator('[data-testid="dashboard-kpi-card"]')
   const bgColor = await dashboardCard.evaluate(
     (el) => window.getComputedStyle(el).backgroundColor,
   )
   expect(bgColor).toBe('rgb(30, 41, 59)') // Validates expected theme token application
   ```
2. **A/B Dynamic Class Switcher**:
   The Host UI includes an interactive "A/B Theme & Specificity Switcher" (e.g. Default vs. High-Contrast Indigo mode).
   - Playwright clicks the A/B toggle.
   - Tests assert that the new class is applied instantaneously across both MFs and that computed styles update accordingly without specificity collisions.
3. **Cascade Order Invariance Test**:
   Validates that whether `mf-dashboard` or `mf-chat` is mounted first or second, their computed styles remain 100% stable and identical.
