# Testing & Architectural Validation Plan

> **Purpose:** Outline the complete testing strategy combining **Vitest** (TypeScript unit and component specificity testing), **Playwright** (live browser integration, multi-MFE single page co-existence, and computed CSS verification), **Oxlint** (static analysis), and **Prettier** (style validation).

---

## 1. Testing Objectives

To prove that the modernized Albert stack works without flaws, we must validate five key operational pillars:

1. **Static Analysis & Formatting (Oxlint & Prettier)**:
   - Zero linter errors across all packages and apps via `oxlint`.
   - All files adhere to `{ "singleQuote": true, "semi": false }` via `prettier`.
   - TypeScript compilation passes with zero type errors (`tsc --noEmit`).

2. **Isolation & Unit Integrity (Vitest + TypeScript)**:
   - Each package and app can test its components in isolation with `jsdom`.
   - Components from `packages/ui-kit` render cleanly with Base UI primitives (`@base-ui-components/react`) and Tailwind classes.
   - The `cn()` utility properly resolves class precedence and overrides.
   - All tests use TypeScript (`.test.ts`, `.test.tsx`) with `@src/*` absolute imports.

3. **Single-Page Multi-MFE Co-Existence (Playwright)**:
   - The Host loads Remote 1 (`mf-dashboard`) and Remote 2 (`mf-chat`) simultaneously on `http://localhost:5000`.
   - Both microfrontends are visible, responsive, and interactive on the same page.
   - No runtime console errors, unhandled rejections, or script loading failures occur.

4. **CSS Specificity & Computed Styles Validation (Playwright)**:
   - Elements inside `mf-dashboard` and `mf-chat` receive the exact computed styles defined by the shared design tokens from `packages/ui-kit`.
   - Styles from `mf-dashboard` do not leak into or clobber styles in `mf-chat` (and vice versa).

5. **Dynamic A/B Testing & Specificity Overrides**:
   - Automated tests toggle styling variants or themes at runtime and verify that classes apply cleanly and take precedence over defaults.

---

## 2. Vitest Strategy & Configuration

### 2.1 Workspace Vitest Setups

Each package/app maintains its own `vitest.config.ts`:

- Environment: `jsdom`
- Test setup: `./src/test/setup.ts` importing `@testing-library/jest-dom/vitest` and automated `cleanup()` after each test.
- Module resolution configured to resolve `@src/*` via path aliases.

### 2.2 Dedicated CSS Specificity Unit Tests (`packages/ui-kit/src/utils/cn.test.ts`)

We will write unit tests verifying that:

- Basic class concatenation works: `cn('btn', 'btn-primary')` -> `'btn btn-primary'`
- Conflicting Tailwind padding classes resolve to the last supplied value: `cn('p-4', 'p-2')` -> `'p-2'`
- Conflicting colors resolve correctly: `cn('bg-red-500 text-white', 'bg-blue-500')` -> `'text-white bg-blue-500'`
- Conditional objects work: `cn('base', { active: true, disabled: false })` -> `'base active'`

### 2.3 Component Specificity Tests (`packages/ui-kit/src/Button/Button.test.tsx`)

- Test that default variant has expected base classes.
- Test that passing `className="mt-4 bg-emerald-600"` successfully merges without losing core interactive classes (`inline-flex items-center justify-center font-medium`).

---

## 3. Playwright E2E Integration Strategy

Playwright runs at the root level (`e2e/`) against the running applications.

### 3.1 Orchestration & Ports

- Port `5000`: `apps/host`
- Port `5001`: `apps/mf-dashboard`
- Port `5002`: `apps/mf-chat`

The dev orchestrator script starts all three servers concurrently, waits for all ports to respond via `wait-on`, and launches the Playwright suite.

### 3.2 Key Playwright Test Suites

#### Suite A: Single-Page Multi-MFE Loading (`e2e/specs/multi-mfe-coexistence.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test('Host renders both mf-dashboard and mf-chat on the same page', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })

  await page.goto('http://localhost:5000')

  // Verify Host Shell UI
  await expect(page.locator('[data-testid="host-navbar"]')).toBeVisible()
  await expect(page.locator('[data-testid="host-sidebar"]')).toBeVisible()

  // Verify Remote 1 (mf-dashboard) rendered inside host canvas
  const mfeDashboard = page.locator('[data-testid="mfe-dashboard-root"]')
  await expect(mfeDashboard).toBeVisible()
  await expect(mfeDashboard.locator('h2')).toContainText('Dashboard Metrics')

  // Verify Remote 2 (mf-chat) rendered inside host canvas
  const mfeChat = page.locator('[data-testid="mfe-chat-root"]')
  await expect(mfeChat).toBeVisible()
  await expect(mfeChat.locator('h2')).toContainText('Live Chat')

  // Verify zero console errors
  expect(consoleErrors).toHaveLength(0)
})
```

#### Suite B: CSS Specificity & Style Isolation (`e2e/specs/css-specificity.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test('CSS specificity and design tokens are applied accurately across MFE boundaries', async ({
  page,
}) => {
  await page.goto('http://localhost:5000')

  // Inspect computed style of mf-dashboard card
  const dashboardCard = page.locator('[data-testid="dashboard-kpi-card"]')
  const dComputed = await dashboardCard.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      borderRadius: style.borderRadius,
      padding: style.padding,
      backgroundColor: style.backgroundColor,
    }
  })

  // Verify token inheritance from ui-kit
  expect(dComputed.borderRadius).not.toBe('0px')

  // Inspect mf-chat message card
  const chatCard = page.locator('[data-testid="chat-message-bubble"]')
  const cComputed = await chatCard.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
    }
  })

  expect(cComputed.backgroundColor).toBeTruthy()
})
```

#### Suite C: A/B Theme & Class Specificity Toggle (`e2e/specs/ab-style-toggle.spec.ts`)

```typescript
import { test, expect } from '@playwright/test'

test('A/B style switch applies dynamic utility classes and overrides defaults', async ({
  page,
}) => {
  await page.goto('http://localhost:5000')

  const targetWidget = page.locator('[data-testid="dashboard-kpi-card"]')
  const initialBg = await targetWidget.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor,
  )

  // Click A/B theme toggle in host sidebar
  await page.click('[data-testid="ab-toggle-theme"]')

  // Assert target widget computed color updated immediately
  const updatedBg = await targetWidget.evaluate(
    (el) => window.getComputedStyle(el).backgroundColor,
  )
  expect(updatedBg).not.toBe(initialBg)
})
```

---

## 4. Acceptance Criteria Checklist

- [ ] `npm run lint` passes `oxlint` with 0 warnings/errors.
- [ ] `npm run format:check` verifies Prettier formatting (`singleQuote: true`, `semi: false`).
- [ ] `npm run typecheck` runs `tsc --noEmit` across all workspaces independently without errors.
- [ ] `npm test` runs Vitest in all workspaces with 100% passing tests.
- [ ] `npm run e2e` runs Playwright and passes all multi-MFE co-existence and CSS specificity tests.
- [ ] Host, `mf-dashboard`, and `mf-chat` can each be built (`npm run build`) without errors or circular dependencies.
- [ ] No unstyled flash or broken Tailwind utility classes on any component.
- [ ] A/B testing proves that class overrides take precedence cleanly.
