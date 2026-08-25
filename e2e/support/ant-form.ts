import { type Locator, type Page, expect } from '@playwright/test';

/**
 * Helpers for interacting with Ant Design form controls the way the
 * idreesia-web app builds them (see idreesia-web/imports/ui/modules/helpers/fields).
 *
 * AntD's Form.Item renders a `<label title="...">` whose `title` attribute
 * always holds the exact, untruncated label text - that gives us a stable,
 * exact-match hook into a specific field without depending on DOM order or
 * generated ids.
 */

export const formItemByLabel = (scope: Locator | Page, label: string): Locator =>
  scope.locator(`.ant-form-item:has(label[title="${label}"])`).first();

export async function fillTextField(
  scope: Locator | Page,
  label: string,
  value: string
): Promise<void> {
  const input = formItemByLabel(scope, label).locator('input, textarea').first();
  await input.fill(value);
}

export async function selectOption(
  scope: Locator | Page,
  page: Page,
  label: string,
  optionText: string | string[]
): Promise<void> {
  const options = Array.isArray(optionText) ? optionText : [optionText];
  const selector = formItemByLabel(scope, label).locator('.ant-select');
  await selector.click();

  const dropdown = page.locator('.ant-select-dropdown:visible').last();
  for (const option of options) {
    await dropdown.locator('.ant-select-item-option', { hasText: option }).first().click();
  }
  // Close the dropdown so it doesn't intercept subsequent clicks.
  await page.keyboard.press('Escape');
}

export async function pickColor(
  scope: Locator | Page,
  page: Page,
  label: string,
  hex: string
): Promise<void> {
  const trigger = formItemByLabel(scope, label).locator('.ant-color-picker-trigger');
  await trigger.click();

  // .last(): the popover is a body-level portal keyed to whichever trigger
  // is currently open, so if a previous field's popover hasn't finished
  // closing yet this can transiently match more than one hex input.
  const hexInput = page.locator('.ant-color-picker-hex-input input').last();
  await expect(hexInput).toBeVisible();
  await hexInput.fill(hex.replace('#', ''));
  await hexInput.press('Enter');
  // Escape alone doesn't reliably close this popover; click the field's own
  // label (inert, but outside the popover) to blur and dismiss it before
  // opening the next color field's popover.
  await formItemByLabel(scope, label).locator('label').click();
}

export async function confirmPopconfirm(page: Page): Promise<void> {
  const popconfirm = page.locator('.ant-popconfirm', { hasText: 'Yes' }).last();
  await expect(popconfirm).toBeVisible();
  await popconfirm.getByRole('button', { name: 'Yes' }).click();
}

export async function expectToast(page: Page, text: string): Promise<void> {
  await expect(
    page.locator('.ant-message-notice-title', { hasText: text }).last()
  ).toBeVisible();
}
