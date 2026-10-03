import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  use: { baseURL: 'http://127.0.0.1:3000', viewport: {width: 390, height: 844}, launchOptions: { executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined) } },
  webServer: { command: 'npm start', url: 'http://127.0.0.1:3000', reuseExistingServer: !process.env.CI },
});
