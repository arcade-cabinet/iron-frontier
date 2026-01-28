import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 1,
  fullyParallel: false,
  reporter: 'list',
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: 'http://127.0.0.1:8101',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'pnpm exec ng serve --host 127.0.0.1 --port 8101 --no-open',
    url: 'http://127.0.0.1:8101',
    reuseExistingServer: true,
    timeout: 180_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'iphone-15',
      use: { ...devices['iPhone 15'] },
    },
    {
      name: 'pixel-7',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'ipad-pro-11',
      use: { ...devices['iPad Pro 11'] },
    },
    {
      name: 'folded-phone',
      use: {
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'unfolded-tablet',
      use: {
        viewport: { width: 820, height: 960 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
