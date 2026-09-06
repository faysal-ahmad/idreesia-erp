import { test, expect } from '@playwright/test';
import { AdminPaths } from '../../support/constants';
import { fillTextField, selectOption, pickColor, confirmPopconfirm, expectToast } from '../../support/ant-form';
import { expectBreadcrumb, expectPageLoaded, tableRow, tableRows, editRowByText, deleteRowByText } from '../../support/list-page';

/**
 * Full CRUD coverage for Admin > Reference Data > People Tags
 * (idreesia-web/imports/ui/modules/admin/people-tags/list.tsx), the modal-create
 * pattern described in docs/ui-design-guidelines.md Part A §5.
 */
test.describe('Admin / People Tags', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(AdminPaths.peopleTags);
    await expectPageLoaded(page);
    await expectBreadcrumb(page, 'Admin', 'People Tags');
  });

  test('creates, edits, and deletes a tag', async ({ page }) => {
    const tagName = `E2E Tag ${Date.now()}`;
    const updatedName = `${tagName} (updated)`;

    await page.getByRole('button', { name: 'New Tag' }).click();
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.ant-modal-title')).toHaveText('New Tag');

    await fillTextField(modal, 'Name', tagName);
    await pickColor(modal, page, 'Color', '#ff0000');
    await pickColor(modal, page, 'Text Color', '#ffffff');
    await selectOption(modal, page, 'Modules', ['Security']);

    await modal.getByRole('button', { name: 'Save' }).click();
    await expectToast(page, 'Tag created.');
    await expect(modal).toBeHidden();

    const row = tableRow(page, tagName);
    await expect(row).toBeVisible();
    await expect(row.getByText('Security')).toBeVisible();

    // Edit
    await editRowByText(page, tagName);
    const editModal = page.locator('.ant-modal');
    await expect(editModal.locator('.ant-modal-title')).toHaveText('Edit Tag');
    await fillTextField(editModal, 'Name', updatedName);
    await editModal.getByRole('button', { name: 'Save' }).click();
    await expectToast(page, 'Tag updated.');

    await expect(tableRow(page, updatedName)).toBeVisible();

    // Delete
    await deleteRowByText(page, updatedName);
    await confirmPopconfirm(page);
    await expect(tableRow(page, updatedName)).toHaveCount(0);
  });

  test('requires name, color, text color, and at least one module', async ({ page }) => {
    await page.getByRole('button', { name: 'New Tag' }).click();
    const modal = page.locator('.ant-modal');

    await modal.getByRole('button', { name: 'Save' }).click();

    await expect(modal.getByText('Please input a name for the tag.')).toBeVisible();
    await expect(modal.getByText('Please pick a color for the tag.')).toBeVisible();
    await expect(modal.getByText('Please pick a text color for the tag.')).toBeVisible();
    await expect(modal.getByText('Please select at least one module.')).toBeVisible();
  });

  test('cancel closes the modal without creating a tag', async ({ page }) => {
    const initialRowCount = await tableRows(page).count();

    await page.getByRole('button', { name: 'New Tag' }).click();
    const modal = page.locator('.ant-modal');
    await fillTextField(modal, 'Name', 'Should not be saved');
    await modal.getByRole('button', { name: 'Cancel' }).click();

    await expect(modal).toBeHidden();
    await expect(tableRows(page)).toHaveCount(initialRowCount);
  });
});
