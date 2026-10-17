import { test, expect } from '@playwright/test'

test('Host renders both mf-dashboard and mf-chat concurrently on the same page', async ({
  page,
}) => {
  const consoleErrors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })

  await page.goto('/')

  // Verify Host Shell UI
  await expect(page.locator('[data-testid="host-navbar"]')).toBeVisible()
  await expect(page.locator('[data-testid="host-sidebar"]')).toBeVisible()

  // Verify Remote 1 (mf-dashboard) rendered inside host canvas
  const mfeDashboard = page.locator('[data-testid="mfe-dashboard-root"]')
  await expect(mfeDashboard).toBeVisible()
  await expect(mfeDashboard.locator('h2')).toContainText('Dashboard Metrics')
  await expect(
    mfeDashboard.locator('[data-testid="dashboard-kpi-card"]'),
  ).toBeVisible()

  // Verify Remote 2 (mf-chat) rendered inside host canvas
  const mfeChat = page.locator('[data-testid="mfe-chat-root"]')
  await expect(mfeChat).toBeVisible()
  await expect(mfeChat.locator('h2')).toContainText('Live Chat')
  await expect(
    mfeChat.locator('[data-testid="chat-message-bubble"]').first(),
  ).toBeVisible()

  // Verify zero console errors
  expect(consoleErrors).toHaveLength(0)
})
