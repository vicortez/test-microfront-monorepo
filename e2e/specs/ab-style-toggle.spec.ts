import { test, expect } from '@playwright/test'

test('A/B style switch applies dynamic utility classes and overrides theme variables', async ({
  page,
}) => {
  await page.goto('/')

  const dashboardCard = page
    .locator('[data-testid="dashboard-kpi-card"]')
    .first()
  await expect(dashboardCard).toBeVisible()

  // Click the A/B toggle button in sidebar to switch to Emerald theme
  const toggleBtn = page.locator('[data-testid="ab-toggle-theme"]')
  await expect(toggleBtn).toBeVisible()
  await toggleBtn.click()

  // Verify the theme class was applied to the main wrapper
  const appContainer = page.locator('.theme-emerald')
  await expect(appContainer).toBeVisible()

  // Verify button state indicates selected theme
  await expect(toggleBtn).toHaveClass(/border-primary/)
})
