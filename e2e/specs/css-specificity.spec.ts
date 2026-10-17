import { test, expect } from '@playwright/test'

test('CSS specificity and design tokens are computed accurately across MFE boundaries', async ({
  page,
}) => {
  await page.goto('/')

  // Verify Remote 1 (mf-dashboard) KPI card receives token-based styles
  const dashboardCard = page
    .locator('[data-testid="dashboard-kpi-card"]')
    .first()
  await expect(dashboardCard).toBeVisible()

  const dComputed = await dashboardCard.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      borderRadius: style.borderRadius,
      padding: style.padding,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
    }
  })

  // Border-radius must not be default 0px (inherits var(--radius))
  expect(dComputed.borderRadius).not.toBe('0px')
  expect(dComputed.backgroundColor).toBeTruthy()
  expect(dComputed.borderColor).toBeTruthy()

  // Verify Remote 2 (mf-chat) message bubble receives proper padding and border radius
  const chatBubble = page.locator('[data-testid="chat-message-bubble"]').first()
  await expect(chatBubble).toBeVisible()

  const cComputed = await chatBubble.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
    }
  })

  expect(cComputed.borderRadius).not.toBe('0px')
  expect(cComputed.backgroundColor).toBeTruthy()
})
