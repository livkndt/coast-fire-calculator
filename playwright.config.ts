import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // Serves the production build. Run `npm run build` before `npm run test:e2e`.
    // -l sets the port; -s enables SPA fallback so /explainer doesn't 404.
    command: 'npx serve dist -l 4173 -s',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
})
