import { defineConfig } from '@playwright/test';
const base = process.env.PAGES_BASE_PATH || '/cv/';
export default defineConfig({
  testDir: './tests/e2e',
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: process.env.TEST_BASE_URL || `http://127.0.0.1:4188${base}`, browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: process.env.TEST_BASE_URL ? undefined : {
    command: 'node scripts/serve-static.mjs',
    url: `http://127.0.0.1:4188${base}`,
    reuseExistingServer: false,
  },
});
