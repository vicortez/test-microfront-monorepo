import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 3,
  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5000',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'npm run dev -w apps/host',
      url: 'http://localhost:5000',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
    {
      command: 'npm run dev -w apps/mf-dashboard',
      url: 'http://localhost:5001',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
    {
      command: 'npm run dev -w apps/mf-chat',
      url: 'http://localhost:5002',
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
    },
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
