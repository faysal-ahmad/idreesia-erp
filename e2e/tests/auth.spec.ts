import { test, expect } from '@playwright/test';
import { AdminCredentials } from '../support/constants';

// Exercise the login form itself, so this file opts out of the shared
// logged-in storageState that every other spec uses. Playwright treats an
// `undefined` override as "no override" (project storageState still wins);
// an explicit empty state is what actually yields a logged-out context.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication', () => {
  test('logs in with valid credentials and reaches the app shell', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Login to Idreesia')).toBeVisible();

    await page.getByPlaceholder('Email / Username').fill(AdminCredentials.userName);
    await page.getByPlaceholder('Password').fill(AdminCredentials.password);
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.locator('.ant-layout-sider')).toBeVisible({ timeout: 20000 });
    await expect(page.getByRole('heading', { name: 'Login to Idreesia' })).toHaveCount(0);
  });

  test('rejects an incorrect password', async ({ page }) => {
    await page.goto('/');

    await page.getByPlaceholder('Email / Username').fill(AdminCredentials.userName);
    await page.getByPlaceholder('Password').fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.locator('.ant-message-notice-title')).toBeVisible();
    // Still on the login card - no navigation happened.
    await expect(page.getByText('Login to Idreesia')).toBeVisible();
  });

  test('requires both fields before submitting', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Log in' }).click();

    await expect(page.getByText('Please input your email or username.')).toBeVisible();
    await expect(page.getByText('Please input your password.')).toBeVisible();
  });

  test('logs out back to the login form', async ({ page }) => {
    await page.goto('/');
    await page.getByPlaceholder('Email / Username').fill(AdminCredentials.userName);
    await page.getByPlaceholder('Password').fill(AdminCredentials.password);
    await page.getByRole('button', { name: 'Log in' }).click();
    await expect(page.locator('.ant-layout-sider')).toBeVisible({ timeout: 20000 });

    await page.locator('.ant-layout-header').getByRole('img', { name: 'user' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    await expect(page.getByText('Login to Idreesia')).toBeVisible();
  });
});
