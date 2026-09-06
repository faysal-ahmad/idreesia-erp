import { test, expect } from '@playwright/test';
import { AdminPaths } from '../../support/constants';
import { fillTextField } from '../../support/ant-form';
import { expectBreadcrumb, expectPageLoaded, tableRow, deleteRowByText } from '../../support/list-page';

/**
 * Full-page create flow for Admin > Reference Data > Cities & Mehfils
 * (idreesia-web/imports/ui/modules/admin/cities), the "full new page" pattern
 * from docs/ui-design-guidelines.md Part B §7 - contrast with the
 * modal-create pattern covered in admin/people-tags.spec.ts.
 */
test.describe('Admin / Cities & Mehfils', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AdminPaths.cities);
    await expectPageLoaded(page);
    await expectBreadcrumb(page, 'Admin', 'Cities & Mehfils', 'List');
  });

  test('creates and then deletes a city', async ({ page }) => {
    const cityName = `E2E City ${Date.now()}`;

    await page.getByRole('button', { name: 'New City' }).click();
    await expectBreadcrumb(page, 'Cities & Mehfils', 'New');

    await fillTextField(page, 'City Name', cityName);
    await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
    await page.getByRole('button', { name: 'Save' }).click();

    // Save navigates back to the list (history.goBack()). The list is
    // alphabetically sorted and paginated (default pageSize 20) over
    // whatever real data this environment already has, so a fresh
    // "E2E City ..." row is very unlikely to land on the default first
    // page - request every row in one page instead of paging to find it.
    await expectBreadcrumb(page, 'Admin', 'Cities & Mehfils', 'List');
    await page.goto(`${AdminPaths.cities}?pageSize=1000`);
    await expectPageLoaded(page);
    await expect(tableRow(page, cityName)).toBeVisible();

    // Cities delete directly, with no Popconfirm (see cities/list/list.tsx).
    // The removeCity mutation has no refetchQueries, so the row lingers in
    // Apollo's cached list until something re-fetches it - reload to see
    // the persisted result rather than the stale cache.
    await deleteRowByText(page, cityName);
    await page.reload();
    await expectPageLoaded(page);
    await expect(tableRow(page, cityName)).toHaveCount(0);
  });

  test('Save stays disabled until a field is touched, and requires a city name', async ({ page }) => {
    await page.getByRole('button', { name: 'New City' }).click();

    const saveButton = page.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeDisabled();

    await fillTextField(page, 'City Name', 'temp');
    await expect(saveButton).toBeEnabled();

    await fillTextField(page, 'City Name', '');
    await saveButton.click();
    await expect(page.getByText('Please input a name for the city.')).toBeVisible();
  });

  test('cancel returns to the list without creating a city', async ({ page }) => {
    await page.getByRole('button', { name: 'New City' }).click();
    await fillTextField(page, 'City Name', 'Should not be saved');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expectBreadcrumb(page, 'Admin', 'Cities & Mehfils', 'List');
    await expect(tableRow(page, 'Should not be saved')).toHaveCount(0);
  });
});
