import { test, expect } from '@playwright/test';
import { AdminPaths, ModulePaths } from '../../support/constants';
import { expectPageLoaded, tableRows } from '../../support/list-page';

/**
 * The Stores (Inventory) module is scoped per physical store - every route
 * under idreesia-web/imports/ui/modules/stores/router.tsx requires a
 * :physicalStoreId, and the module has no route (and no admin UI action) for
 * an empty `/stores`. There is also no delete action for a physical store
 * (idreesia-web/imports/ui/modules/admin/physical-stores has create/edit
 * only), so unlike admin/cities.spec.ts and admin/people-tags.spec.ts this
 * suite does not create its own fixture store - doing so would leave
 * permanent, un-deletable data behind. Instead it exercises the real store
 * picked from the sidebar, skipping cleanly on an environment with none.
 */
test.describe('Stores / Physical Store navigation', () => {
  test('selecting a physical store from the sidebar opens its Stock Items list', async ({ page }) => {
    await page.goto(AdminPaths.physicalStores);
    await expectPageLoaded(page);

    // This list has no loading state (see admin/physical-stores/list.tsx) -
    // it renders zero rows for an instant while the query is in flight, so a
    // bare `.count()` here would race the data and skip spuriously. Wait for
    // an actual row instead of sampling immediately.
    const firstStoreLink = tableRows(page).locator('a').first();
    const hasStore = await firstStoreLink
      .waitFor({ state: 'visible', timeout: 5000 })
      .then(() => true)
      .catch(() => false);
    test.skip(!hasStore, 'No physical stores exist in this environment - create one via Admin > Physical Stores first.');
    const storeName = (await firstStoreLink.textContent())!.trim();

    await page.goto(ModulePaths.stores);
    await page.getByRole('menuitem', { name: storeName, exact: true }).or(
      page.locator('.ant-menu-submenu-title', { hasText: storeName })
    ).first().click();
    await page.getByRole('menuitem', { name: 'Stock Items' }).click();

    await expect(page).toHaveURL(/\/stores\/[^/]+\/stock-items/);
    await expectPageLoaded(page);
    await expect(page.getByRole('button', { name: 'New Stock Item' })).toBeVisible();
  });
});
