import { test, expect } from '@playwright/test';
import { AdminPaths } from '../../support/constants';
import { expectBreadcrumb, expectPageLoaded, tableRows } from '../../support/list-page';

/**
 * Admin > Access Management > Users
 * (idreesia-web/imports/ui/modules/admin/users) - list smoke, the Filter
 * popover / chips pattern (docs/ui-design-guidelines.md Part A §2-3), and
 * New/Cancel navigation. User creation itself involves password + role
 * wiring that is out of scope here; see admin/people-tags.spec.ts and
 * admin/cities.spec.ts for full create/delete coverage of simpler entities.
 */
test.describe('Admin / Users', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AdminPaths.users);
    await expectPageLoaded(page);
    await expectBreadcrumb(page, 'Admin', 'Users', 'List');
  });

  test('renders the users table with its expected columns and real rows', async ({ page }) => {
    // Not asserting on a specific seeded account: on a populated environment
    // the bootstrap admin account may be filtered out of this list entirely
    // (observed on a real staging DB - it never appears here even paginated
    // out to 1000/page), so this only checks the table renders real,
    // structurally-correct data rather than a specific identity.
    await expect(page.locator('.ant-table-thead')).toContainText('Email / User Name / Display Name');
    await expect(tableRows(page).first()).toBeVisible();
  });

  test('New User navigates to the new-user form and Cancel returns to the list', async ({ page }) => {
    await page.getByRole('button', { name: 'New User' }).click();
    await expectBreadcrumb(page, 'Admin', 'Users', 'New');

    await page.getByRole('button', { name: 'Cancel' }).click();
    await expectBreadcrumb(page, 'Admin', 'Users', 'List');
  });

  test('filter popover applies a module access filter and shows a clearable chip', async ({ page }) => {
    await page.getByRole('button', { name: 'Filter' }).click();

    const panel = page.locator('.list-filter-panel');
    await expect(panel).toBeVisible();

    await panel.locator('.ant-select').click();
    await page.locator('.ant-select-dropdown:visible .ant-select-item-option', { hasText: 'Security' }).click();
    await panel.getByRole('button', { name: 'Search' }).click();

    const chip = page.locator('.list-filter-chips .ant-tag', { hasText: 'Module Access: Security' });
    await expect(chip).toBeVisible();

    await page.getByText('Clear all').click();
    await expect(chip).toHaveCount(0);
  });
});
