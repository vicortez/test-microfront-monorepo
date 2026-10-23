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

  // Verify Remote 3 (mf-analytics - pure JS, no Tailwind) UI Kit Button receives proper styling
  const analyticsBtn = page.locator('[data-testid="analytics-export-btn"]')
  await expect(analyticsBtn).toBeVisible()

  const aBtnComputed = await analyticsBtn.evaluate((el) => {
    const style = window.getComputedStyle(el)
    return {
      borderRadius: style.borderRadius,
      backgroundColor: style.backgroundColor,
      color: style.color,
      display: style.display,
      cursor: style.cursor,
    }
  })

  // Button must receive token-derived border radius and background color
  expect(aBtnComputed.borderRadius).not.toBe('0px')
  expect(aBtnComputed.backgroundColor).toBeTruthy()
  expect(aBtnComputed.display).toContain('flex')
})

test('MFE-specific Tailwind utility classes (bg-amber-400 in mf-dashboard) are applied when running inside host', async ({
  page,
}) => {
  await page.goto('/')

  const badge = page.locator('[data-testid="dashboard-mfe-badge"]')
  await expect(badge).toBeVisible()

  const { badgeBg, expectedAmber400 } = await badge.evaluate((el) => {
    const probe = document.createElement('div')
    probe.style.backgroundColor = 'var(--color-amber-400)'
    document.body.appendChild(probe)
    const expected = window.getComputedStyle(probe).backgroundColor
    probe.remove()

    return {
      badgeBg: window.getComputedStyle(el).backgroundColor,
      expectedAmber400: expected,
    }
  })

  expect(badgeBg).not.toBe('rgba(0, 0, 0, 0)')
  expect(badgeBg).toBe(expectedAmber400)
})
