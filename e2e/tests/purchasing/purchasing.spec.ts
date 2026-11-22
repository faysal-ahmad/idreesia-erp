import { test, expect } from '@playwright/test';
import { PurchasingPaths } from '../../support/constants';
import { fillTextField, confirmPopconfirm, expectToast } from '../../support/ant-form';
import { expectBreadcrumb, expectPageLoaded, tableRow, deleteRowByText } from '../../support/list-page';

/**
 * Purchasing (idreesia-web/imports/ui/modules/purchasing): every section
 * loads for an admin, and the setup lists (Vendors, Catalog) support the
 * modal-create pattern from docs/ui-design-guidelines.md Part A §5.
 *
 * The documents (requisitions, orders, invoices...) are covered by the unit
 * tests of server/business-logic/purchasing; this is the UI wiring check.
 */
const sections: Array<{ path: string; breadcrumbs: string[] }> = [
  { path: PurchasingPaths.dashboard, breadcrumbs: ['Purchasing', 'Dashboard'] },
  { path: PurchasingPaths.requisitions, breadcrumbs: ['Purchasing', 'Requisitions'] },
  { path: PurchasingPaths.quotes, breadcrumbs: ['Purchasing', 'Quotes'] },
  { path: PurchasingPaths.orders, breadcrumbs: ['Purchasing', 'Purchase Orders'] },
  { path: PurchasingPaths.receipts, breadcrumbs: ['Purchasing', 'Goods Receipts'] },
  { path: PurchasingPaths.invoices, breadcrumbs: ['Purchasing', 'Invoices'] },
  { path: PurchasingPaths.payments, breadcrumbs: ['Purchasing', 'Payments'] },
  { path: PurchasingPaths.vendors, breadcrumbs: ['Purchasing', 'Vendors'] },
  { path: PurchasingPaths.catalog, breadcrumbs: ['Purchasing', 'Catalog'] },
  { path: PurchasingPaths.reports, breadcrumbs: ['Purchasing', 'Reports'] },
];

test.describe('Purchasing / navigation', () => {
  for (const { path, breadcrumbs } of sections) {
    test(`loads ${path}`, async ({ page }) => {
      await page.goto(path);
      await expectPageLoaded(page);
      await expectBreadcrumb(page, ...breadcrumbs);
    });
  }

  test('the module root opens the first section', async ({ page }) => {
    await page.goto('/purchasing');
    await expectPageLoaded(page);
    await expect(page).toHaveURL(/\/purchasing\/dashboard/);
  });
});

test.describe('Purchasing / Vendors', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PurchasingPaths.vendors);
    await expectPageLoaded(page);
  });

  test('creates, deactivates and deletes a vendor', async ({ page }) => {
    const name = `E2E Vendor ${Date.now()}`;

    await page.getByRole('button', { name: 'New Vendor' }).click();
    const modal = page.locator('.ant-modal');
    await expect(modal.locator('.ant-modal-title')).toHaveText('New Vendor');
    await fillTextField(modal, 'Name', name);
    await modal.getByRole('button', { name: 'Save' }).click();
    await expectToast(page, 'Vendor created');
    await expect(modal).toBeHidden();

    const row = tableRow(page, name);
    await expect(row).toBeVisible();

    await row.locator('[aria-label="pause-circle"]').click();
    await expect(tableRow(page, name).getByText('Inactive')).toBeVisible();

    await deleteRowByText(page, name);
    await confirmPopconfirm(page);
    await expect(tableRow(page, name)).toHaveCount(0);
  });

  test('requires a name', async ({ page }) => {
    await page.getByRole('button', { name: 'New Vendor' }).click();
    const modal = page.locator('.ant-modal');
    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(modal.getByText('Please input the vendor name.')).toBeVisible();
  });
});

test.describe('Purchasing / Catalog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PurchasingPaths.catalog);
    await expectPageLoaded(page);
  });

  test('creates and deletes a catalog item', async ({ page }) => {
    const name = `E2E Item ${Date.now()}`;

    await page.getByRole('button', { name: 'New Item' }).click();
    const modal = page.locator('.ant-modal');
    await fillTextField(modal, 'Name', name);
    await fillTextField(modal, 'Unit', 'box');
    await modal.getByRole('button', { name: 'Save' }).click();
    await expectToast(page, 'Catalog item created');

    const row = tableRow(page, name);
    await expect(row).toBeVisible();
    await expect(row.getByText('box')).toBeVisible();

    await deleteRowByText(page, name);
    await confirmPopconfirm(page);
    await expect(tableRow(page, name)).toHaveCount(0);
  });

  test('requires a name and a unit', async ({ page }) => {
    await page.getByRole('button', { name: 'New Item' }).click();
    const modal = page.locator('.ant-modal');
    await modal.getByRole('button', { name: 'Save' }).click();
    await expect(modal.getByText('Please input the item name.')).toBeVisible();
    await expect(modal.getByText('Please input the unit (e.g. kg, box).')).toBeVisible();
  });
});
