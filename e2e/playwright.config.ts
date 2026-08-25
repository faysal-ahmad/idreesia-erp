import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
// Importing this loads e2e/.env (gitignored - see .env.example) as a side
// effect, before PLAYWRIGHT_BASE_URL below is read.
import { AUTH_STORAGE_STATE } from './support/constants';

/**
 * E2E suite for idreesia-web.
 *
 * Prerequisite: the app must already be running and reachable at baseURL
 * (e.g. `yarn docker:up`, or your local Meteor dev server) against a
 * database that has run its startup migrations (idreesia-web/imports/startup/server/migrations),
 * which seed the `erp-admin` / `p@ssw0rd` account global-setup.ts logs in with.
 * See e2e/README.md for details.
 */
export default defineConfig({
  testDir: './tests',
  // Playwright resolves output paths against the current working directory,
  // not this config file's directory - pin them under e2e/ explicitly so a
  // run from the repo root (`yarn test:e2e`) doesn't scatter
  // playwright-report/ and test-results/ at the repo root.
  outputDir: path.join(__dirname, 'test-results'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI
    ? [['html', { outputFolder: path.join(__dirname, 'playwright-report') }], ['github']]
    : [['html', { outputFolder: path.join(__dirname, 'playwright-report') }]],
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      // auth.spec.ts logs in fresh per test, and its "logout" test calls the
      // app's real Meteor.logoutOtherClients() - which invalidates every
      // other login token for the account, including the shared one the
      // `setup` project below hands to every other spec. Running this first
      // (starting from no storageState, same as every other project here)
      // means that invalidation happens *before* `setup` logs in, instead of
      // silently killing an already-shared session out from under a
      // parallel test.
      name: 'auth',
      testMatch: /auth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // Logs in once, after `auth` (see above), and saves the resulting
      // session for every test in `chromium` to reuse via storageState.
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
      dependencies: ['auth'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium',
      testIgnore: [/auth\.spec\.ts/, /auth\.setup\.ts/],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: AUTH_STORAGE_STATE },
    },
    // Uncomment to broaden browser coverage once the chromium suite is green.
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});
