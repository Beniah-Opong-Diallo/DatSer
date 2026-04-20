import { defineConfig, devices } from '@playwright/test';

const usePreviewServer = process.env.PLAYWRIGHT_USE_PREVIEW === '1';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  timeout: 30000,
  use: {
    baseURL: usePreviewServer ? 'http://127.0.0.1:4173' : 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: usePreviewServer
      ? 'npm run preview -- --host 127.0.0.1 --port 4173'
      : 'npm run dev',
    url: usePreviewServer ? 'http://127.0.0.1:4173' : 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
