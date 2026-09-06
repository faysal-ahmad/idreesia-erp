import { test, expect } from '@playwright/test';
import { AdminCredentials, AUTH_STORAGE_STATE } from '../support/constants';

/**
 * Playwright "setup project" (see playwright.config.ts's `setup` project,
 * which depends on `auth` and is itself the dependency of `chromium`) - logs
 * in once as the seeded admin user and persists the resulting Meteor login
 * token (stored in localStorage by Meteor.loginWithPassword) as storageState
 * for every other spec to reuse instead of re-driving the login form per test.
 *
 * This runs as its own project *after* the `auth` project rather than as a
 * plain Playwright `globalSetup`, specifically so it logs in *after*
 * auth.spec.ts's "logs out" test has already called the app's real
 * Meteor.logoutOtherClients() - that call invalidates every other login
 * token for the account, which would otherwise silently kill the shared
 * session out from under every parallel test using it.
 */
test('authenticate as admin', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Email / Username').fill(AdminCredentials.userName);
  await page.getByPlaceholder('Password').fill(AdminCredentials.password);
  await page.getByRole('button', { name: 'Log in' }).click();

  // A successful login redirects away from the login card into the app shell.
  await expect(page.locator('.ant-layout-sider')).toBeVisible({ timeout: 20000 });

  await page.context().storageState({ path: AUTH_STORAGE_STATE });
});
