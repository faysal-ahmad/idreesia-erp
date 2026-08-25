import { test, expect } from '@playwright/test';
import { HrPaths } from '../../support/constants';
import { expectBreadcrumb, expectPageLoaded } from '../../support/list-page';

/**
 * HR > Karkuns list (idreesia-web/imports/ui/modules/hr/karkuns) - smoke
 * coverage only. Karkun records carry payroll/attendance history that make
 * a throwaway create/delete cycle risky against a real environment, so this
 * intentionally stays read-only; see admin/people-tags.spec.ts and
 * admin/cities.spec.ts for full CRUD coverage patterns.
 */
test.describe('HR / Karkuns', () => {
  test('list loads with the New Karkun action available', async ({ page }) => {
    await page.goto(HrPaths.karkuns);
    await expectPageLoaded(page);
    await expectBreadcrumb(page, 'HR', 'Karkuns', 'List');
    await expect(page.getByRole('button', { name: 'New Karkun' })).toBeVisible();
  });
});
