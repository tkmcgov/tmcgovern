import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

/*
 * In the Claude Code sandbox a ready-made Chromium lives at /opt/pw-browsers;
 * in GitHub Actions (and anywhere else) Playwright's own downloaded browser
 * is used instead.
 */
const sandboxChromium = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  timeout: 30_000,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4517',
    launchOptions: existsSync(sandboxChromium)
      ? { executablePath: sandboxChromium }
      : {},
  },
  webServer: {
    // serves the built site in dist/ exactly like a static host would
    command: 'npx http-server dist -p 4517 --silent -c-1',
    url: 'http://127.0.0.1:4517/',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
