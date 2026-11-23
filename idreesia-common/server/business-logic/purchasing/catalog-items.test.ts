import { describe, expect, it } from 'vitest';

import { PurchasingCatalogItems } from 'meteor/idreesia-common/server/collections/purchasing';

import {
  createCatalogItem,
  deleteCatalogItem,
  listCatalogItems,
  setCatalogItemActive,
  updateCatalogItem,
} from './index';

const user = { _id: 'u1' };

describe('purchasing catalog items', () => {
  it('creates an item with a name and unit', async () => {
    const item = await createCatalogItem(
      { name: ' A4  Paper ', unit: 'ream', defaultUnitPrice: 1200 },
      user
    );
    expect(item.name).toBe('A4 Paper');
    expect(item.unit).toBe('ream');
    expect(item.defaultUnitPrice).toBe(1200);
    expect(item.isActive).toBe(true);
  });

  it('requires a name and a unit and a non-negative price', async () => {
    await expect(
      createCatalogItem({ name: '', unit: 'kg' }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      createCatalogItem({ name: 'Rice', unit: ' ' }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      createCatalogItem({ name: 'Rice', unit: 'kg', defaultUnitPrice: -1 }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('blocks a duplicate name ignoring case', async () => {
    await createCatalogItem({ name: 'Tea', unit: 'kg' }, user);
    await expect(
      createCatalogItem({ name: 'TEA', unit: 'box' }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('updates and clears optional fields', async () => {
    const item = await createCatalogItem(
      { name: 'Sugar', unit: 'kg', category: 'Food', defaultUnitPrice: 150 },
      user
    );
    const updated = await updateCatalogItem(
      item._id,
      { name: 'Sugar', unit: 'bag' },
      user
    );
    expect(updated.unit).toBe('bag');
    expect(updated.category).toBeUndefined();
    expect(updated.defaultUnitPrice).toBeUndefined();
  });

  it('keeps an optional company, trims it, clears it and searches by it', async () => {
    await PurchasingCatalogItems.removeAsync({});
    const item = await createCatalogItem({ name: 'Tea', unit: 'kg', company: '  Lipton   Ltd ' }, user);
    expect(item.company).toBe('Lipton Ltd');
    await createCatalogItem({ name: 'Rice', unit: 'kg' }, user);

    expect((await listCatalogItems({ search: 'lipton' })).data.map((i) => i.name)).toEqual(['Tea']);

    const cleared = await updateCatalogItem(item._id, { name: 'Tea', unit: 'kg' }, user);
    expect(cleared.company).toBeUndefined();
  });

  it('deactivates, deletes and lists', async () => {
    await PurchasingCatalogItems.removeAsync({});
    const a = await createCatalogItem({ name: 'Axe', unit: 'pc', category: 'Tools' }, user);
    await createCatalogItem({ name: 'Bolt', unit: 'pc' }, user);
    await setCatalogItemActive(a._id, false, user);

    expect((await listCatalogItems({ isActive: true })).data.map((i) => i.name)).toEqual(['Bolt']);
    expect((await listCatalogItems({ search: 'tools' })).totalResults).toBe(1);

    await deleteCatalogItem(a._id, user);
    expect((await listCatalogItems()).totalResults).toBe(1);
  });
});
