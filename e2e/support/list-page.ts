import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Shared helpers for the list-page chrome described in
 * docs/ui-design-guidelines.md (`.list-container` / `.list-table`,
 * `.ant-breadcrumb`, row-action icons, Popconfirm deletes).
 */

export async function expectBreadcrumb(page: Page, ...crumbs: string[]): Promise<void> {
  const breadcrumb = page.locator('.ant-breadcrumb');
  await expect(breadcrumb).toBeVisible();
  for (const crumb of crumbs) {
    await expect(breadcrumb).toContainText(crumb);
  }
}

/** Asserts the page rendered real content, not a stuck spinner or a crashed error boundary. */
export async function expectPageLoaded(page: Page): Promise<void> {
  await expect(page.locator('.ant-spin-spinning')).toHaveCount(0, { timeout: 15000 });
  await expect(page.getByText('Something went wrong')).toHaveCount(0);
}

/**
 * Real data rows only - antd renders a single non-`.ant-table-row` placeholder
 * `<tr>` (its empty state) when a table has no data, which would otherwise be
 * miscounted as a row.
 */
export function tableRows(page: Page): Locator {
  return page.locator('.ant-table-tbody tr.ant-table-row');
}

export function tableRow(page: Page, text: string): Locator {
  return tableRows(page).filter({ hasText: text });
}

export async function deleteRowByText(page: Page, text: string): Promise<void> {
  const row = tableRow(page, text);
  await row.locator('[aria-label="delete"]').last().click();
}

export async function editRowByText(page: Page, text: string): Promise<void> {
  const row = tableRow(page, text);
  await row.locator('[aria-label="edit"]').last().click();
}
