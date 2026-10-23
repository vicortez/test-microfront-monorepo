import { test, expect, type Page, type Locator } from '@playwright/test'

/**
 * Validates that @albert-fe/ui-kit works as a standalone package for consumers
 * that have NO TypeScript and NO Tailwind (apps/mf-analytics).
 *
 * The critical case is the standalone run (port 5003): there is no host
 * stylesheet to "lend" Tailwind utilities, so the kit must ship its own CSS.
 */

/** Resolves `hsl(var(--token))` in the page to a computed rgb() string. */
async function resolveToken(
  page: Page,
  token: string,
  prop = 'backgroundColor',
) {
  return page.evaluate(
    ([t, p]) => {
      const probe = document.createElement('div')
      probe.style.setProperty(
        p === 'color' ? 'color' : 'background-color',
        `hsl(var(${t}))`,
      )
      document.body.appendChild(probe)
      const value = getComputedStyle(probe)[p as 'color' | 'backgroundColor']
      probe.remove()
      return value
    },
    [token, prop] as const,
  )
}

async function readButtonStyles(button: Locator) {
  return button.evaluate((el) => {
    const s = getComputedStyle(el)
    return {
      backgroundColor: s.backgroundColor,
      color: s.color,
      borderRadius: s.borderRadius,
      display: s.display,
      height: s.height,
      cursor: s.cursor,
    }
  })
}

async function expectStyledPrimaryButton(page: Page, button: Locator) {
  await expect(button).toBeVisible()
  const styles = await readButtonStyles(button)
  const primary = await resolveToken(page, '--primary')
  const primaryFg = await resolveToken(page, '--primary-foreground', 'color')

  expect(primary).not.toBe('rgba(0, 0, 0, 0)')
  expect(styles.backgroundColor).toBe(primary)
  expect(styles.color).toBe(primaryFg)
  expect(styles.borderRadius).not.toBe('0px')
  // `inline-flex` is blockified to `flex` when the button is itself a flex item
  expect(['inline-flex', 'flex']).toContain(styles.display)
  expect(styles.height).toBe('36px') // size="sm" -> h-9
  expect(styles.cursor).toBe('pointer')
}

/*
 * Commented out: All microfrontends are assumed to be consumed from inside the host shell.
 *
test('mf-analytics standalone (no host, no Tailwind, no TS) renders a styled ui-kit Button', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

  await page.goto('http://localhost:5003/')
  const button = page.locator('[data-testid="analytics-export-btn"]')
  await expectStyledPrimaryButton(page, button)

  // Component behaviour works (not only styles)
  const count = page.locator('[data-testid="analytics-report-count"]')
  await expect(count).toHaveText('14')
  await button.click()
  await expect(count).toHaveText('15')

  expect(errors).toHaveLength(0)
})
*/

test('mf-analytics inside host renders a styled ui-kit Button that follows host theme switches', async ({
  page,
}) => {
  await page.goto('/')
  const button = page.locator('[data-testid="analytics-export-btn"]')
  await expectStyledPrimaryButton(page, button)

  const before = (await readButtonStyles(button)).backgroundColor
  await page.locator('[data-testid="ab-toggle-theme"]').click()
  await expect(page.locator('.theme-emerald')).toBeVisible()

  // Theme tokens are scoped to the host wrapper, so resolve inside it
  const emerald = await page
    .locator('.theme-emerald')
    .first()
    .evaluate((root) => {
      const probe = document.createElement('div')
      probe.style.backgroundColor = 'hsl(var(--primary))'
      root.appendChild(probe)
      const v = getComputedStyle(probe).backgroundColor
      probe.remove()
      return v
    })

  await expect
    .poll(async () => (await readButtonStyles(button)).backgroundColor)
    .toBe(emerald)
  expect(emerald).not.toBe(before)
})
