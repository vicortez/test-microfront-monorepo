import { test, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const buttonPath = path.resolve(
  process.cwd(),
  'packages/ui-kit/src/components/Button/Button.tsx',
)

test.describe.serial('UI Kit live HMR without manual rebuild', () => {
  let originalContent: string

  test.beforeAll(() => {
    originalContent = fs.readFileSync(buttonPath, 'utf8')
  })

  test.afterEach(() => {
    if (
      originalContent &&
      fs.readFileSync(buttonPath, 'utf8') !== originalContent
    ) {
      fs.writeFileSync(buttonPath, originalContent, 'utf8')
    }
  })

  test('updating Button in packages/ui-kit reflects via HMR across remotes in host without page reload or rebuild', async ({
    page,
  }) => {
    await page.goto('http://localhost:5000/')

    const exportBtn = page.locator('[data-testid="analytics-export-btn"]')
    const dashboardRefreshBtn = page.locator(
      '[data-testid="mfe-dashboard-root"] button[aria-label="Refresh metrics"]',
    )
    const chatSendBtn = page.locator(
      '[data-testid="mfe-chat-root"] button[type="submit"]',
    )

    await expect(exportBtn).toBeVisible()
    await expect(dashboardRefreshBtn).toBeVisible()
    await expect(chatSendBtn).toBeVisible()

    // Mutate state in AnalyticsWidget to verify Fast Refresh preserves component state (no full reload)
    const reportCount = page.locator('[data-testid="analytics-report-count"]')
    await expect(reportCount).toHaveText('14')
    await exportBtn.click()
    await expect(reportCount).toHaveText('15')

    await page.evaluate(() => {
      ;(window as unknown as { __HMR_SENTINEL__?: boolean }).__HMR_SENTINEL__ =
        true
    })

    // Modify packages/ui-kit/src/components/Button/Button.tsx on disk without running any build
    const updatedContent = originalContent.replace(
      'ref={ref}',
      'ref={ref} data-ui-kit-hmr="live-updated"',
    )
    expect(updatedContent).not.toBe(originalContent)
    fs.writeFileSync(buttonPath, updatedContent, 'utf8')

    // All three remotes inside the host should hot-update their Button in-place
    await expect(dashboardRefreshBtn).toHaveAttribute(
      'data-ui-kit-hmr',
      'live-updated',
    )
    await expect(exportBtn).toHaveAttribute('data-ui-kit-hmr', 'live-updated')
    await expect(chatSendBtn).toHaveAttribute('data-ui-kit-hmr', 'live-updated')

    // Confirm no full page reload occurred and state was preserved
    const sentinel = await page.evaluate(
      () =>
        (window as unknown as { __HMR_SENTINEL__?: boolean }).__HMR_SENTINEL__,
    )
    expect(sentinel).toBe(true)
    await expect(reportCount).toHaveText('15')
  })
})
