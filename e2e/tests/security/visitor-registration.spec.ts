import { test, expect } from '@playwright/test';
import { SecurityPaths } from '../../support/constants';
import { fillTextField } from '../../support/ant-form';
import { expectBreadcrumb, expectPageLoaded, tableRows } from '../../support/list-page';

/**
 * Security > Visitor Registration list
 * (idreesia-web/imports/ui/modules/security/visitor-registeration/list/list.tsx),
 * the canonical reference list per docs/ui-design-guidelines.md.
 */
test.describe('Security / Visitor Registration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(SecurityPaths.visitorRegistrationList);
    await expectPageLoaded(page);
    await expectBreadcrumb(page, 'Security', 'Visitor Registration', 'List');
  });

  test('list renders with New Visitor and Scan actions available', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Visitor' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Scan' })).toBeVisible();
  });

  test('New Visitor navigates to the new visitor form', async ({ page }) => {
    await page.getByRole('button', { name: 'New Visitor' }).click();
    await expectBreadcrumb(page, 'Security', 'Visitor Registration', 'New');
  });

  test('filtering by name narrows the list and Clear all resets it', async ({ page }) => {
    const totalRowsBefore = await tableRows(page).count();

    await page.getByRole('button', { name: 'Filter' }).click();
    const panel = page.locator('.list-filter-panel');
    await expect(panel).toBeVisible();

    await fillTextField(panel, 'Name', 'a-name-that-should-not-exist-in-any-seed-data-xyz');
    await panel.getByRole('button', { name: 'Search' }).click();

    await expectPageLoaded(page);
    await expect(tableRows(page)).toHaveCount(0);

    const chip = page.locator('.list-filter-chips .ant-tag');
    await expect(chip.first()).toBeVisible();
    await page.getByText('Clear all').click();

    await expectPageLoaded(page);
    await expect(tableRows(page)).toHaveCount(totalRowsBefore);
  });
});
