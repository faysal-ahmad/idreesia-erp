import { afterEach, describe, expect, it, vi } from 'vitest';

import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

import {
  createIssuanceForm,
  removeIssuanceFormAttachment,
  removeIssuanceForms,
  updateIssuanceForm,
} from './issuance-forms';
import {
  createPurchaseForm,
  removePurchaseFormAttachment,
  removePurchaseForms,
  updatePurchaseForm,
} from './purchase-forms';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

afterEach(() => {
  vi.restoreAllMocks();
});

const level = async (_id: string) =>
  (await StockItems.findOneAsync(_id))?.currentStockLevel;
const item = (_id: string, currentStockLevel: number) =>
  StockItems.insertAsync({ _id, currentStockLevel });

type Items = { stockItemId: string; quantity: number; isInflow?: boolean }[];

// Purchase and issuance forms share their stock math and approval rules. The
// `in` direction is the one that raises stock (purchase: bought, issuance:
// returned).
const kinds = [
  {
    label: 'purchase form',
    collection: PurchaseForms,
    create: (items: Items, storeId = 's1', userId = 'u1') =>
      createPurchaseForm(
        {
          purchaseDate: new Date(),
          receivedBy: 'p1',
          purchasedBy: 'p2',
          physicalStoreId: storeId,
          items,
        },
        userId
      ),
    update: (id: string, items: Items, userId = 'u2') =>
      updatePurchaseForm(
        id,
        {
          purchaseDate: new Date(),
          receivedBy: 'p1',
          purchasedBy: 'p2',
          physicalStoreId: 's1',
          items,
        },
        userId
      ),
    remove: removePurchaseForms,
    removeAttachment: removePurchaseFormAttachment,
    notFound: 'Purchase form not found.',
    approvedError: 'already approved',
  },
  {
    label: 'issuance form',
    collection: IssuanceForms,
    create: (items: Items, storeId = 's1', userId = 'u1') =>
      createIssuanceForm(
        {
          issueDate: new Date(),
          issuedBy: 'p1',
          issuedTo: 'p2',
          physicalStoreId: storeId,
          items,
        },
        userId
      ),
    update: (id: string, items: Items, userId = 'u2') =>
      updateIssuanceForm(
        id,
        {
          issueDate: new Date(),
          issuedBy: 'p1',
          issuedTo: 'p2',
          physicalStoreId: 's1',
          items,
        },
        userId
      ),
    remove: removeIssuanceForms,
    removeAttachment: removeIssuanceFormAttachment,
    notFound: 'Issuance form not found.',
    approvedError: 'already approved',
  },
] as const;

const approve = (collection: { rawCollection(): any }, _id: string) =>
  collection
    .rawCollection()
    .updateOne({ _id }, { $set: { approvedOn: new Date(), approvedBy: 'u9' } });

describe.each(kinds)('$label', kind => {
  const { collection } = kind;
  const find = (_id: string) => (collection as any).findOneAsync(_id);

  it('creates the form with audit fields and applies the stock math', async () => {
    await item('i1', 10);
    await item('i2', 10);
    const id = await kind.create(
      [
        { stockItemId: 'i1', quantity: 4, isInflow: true },
        { stockItemId: 'i2', quantity: 3, isInflow: false },
      ],
      's1',
      'creator'
    );

    expect(await level('i1')).toBe(14);
    expect(await level('i2')).toBe(7);
    const form = await find(id);
    expect(form).toMatchObject({
      physicalStoreId: 's1',
      createdBy: 'creator',
      updatedBy: 'creator',
    });
    expect(form.createdAt).toBeInstanceOf(Date);
    expect(form.approvedOn).toBeUndefined();
  });

  it('allows stock to go negative', async () => {
    await item('i1', 1);
    await kind.create([{ stockItemId: 'i1', quantity: 5, isInflow: false }]);
    expect(await level('i1')).toBe(-4);
  });

  it('moves the levels to match when an unapproved form is updated', async () => {
    await item('i1', 10);
    await item('i2', 10);
    const id = await kind.create([
      { stockItemId: 'i1', quantity: 4, isInflow: true },
    ]);
    expect(await level('i1')).toBe(14);

    await kind.update(
      id,
      [
        { stockItemId: 'i1', quantity: 1, isInflow: true },
        { stockItemId: 'i2', quantity: 2, isInflow: false },
      ],
      'editor'
    );

    expect(await level('i1')).toBe(11);
    expect(await level('i2')).toBe(8);
    const form = await find(id);
    expect(form.items).toHaveLength(2);
    expect(form).toMatchObject({ updatedBy: 'editor', createdBy: 'u1' });
  });

  it('rejects updating a form that does not exist', async () => {
    await expect(kind.update('missing', [])).rejects.toThrow(kind.notFound);
  });

  it('rejects updating an approved form and keeps the levels and the form', async () => {
    await item('i1', 10);
    const id = await kind.create([
      { stockItemId: 'i1', quantity: 4, isInflow: true },
    ]);
    await approve(collection as any, id);

    await expect(
      kind.update(id, [{ stockItemId: 'i1', quantity: 9, isInflow: true }])
    ).rejects.toThrow(kind.approvedError);

    expect(await level('i1')).toBe(14);
    expect((await find(id)).items[0].quantity).toBe(4);
  });

  it('rolls the stock levels back when the update cannot be written', async () => {
    await item('i1', 10);
    const id = await kind.create([
      { stockItemId: 'i1', quantity: 4, isInflow: true },
    ]);
    vi.spyOn(collection as any, 'updateAsync').mockRejectedValueOnce(
      new Error('write failed')
    );

    await expect(
      kind.update(id, [{ stockItemId: 'i1', quantity: 1, isInflow: true }])
    ).rejects.toThrow('write failed');

    expect(await level('i1')).toBe(14);
  });

  it('rolls the form back when the stock level cannot be changed', async () => {
    await item('i1', 10);
    vi.spyOn(StockItems, 'updateAsync').mockRejectedValueOnce(
      new Error('stock failed')
    );

    await expect(
      kind.create([{ stockItemId: 'i1', quantity: 4, isInflow: true }])
    ).rejects.toThrow('stock failed');

    expect(await (collection as any).find({}).countAsync()).toBe(0);
    expect(await level('i1')).toBe(10);
  });

  describe('removing', () => {
    it('reverts unapproved forms of the store and deletes them', async () => {
      await item('i1', 10);
      const a = await kind.create([
        { stockItemId: 'i1', quantity: 4, isInflow: true },
      ]);
      const b = await kind.create([
        { stockItemId: 'i1', quantity: 1, isInflow: false },
      ]);
      expect(await level('i1')).toBe(13);

      expect(await kind.remove('s1', [a, b])).toBe(2);

      expect(await level('i1')).toBe(10);
      expect(await (collection as any).find({}).countAsync()).toBe(0);
    });

    it('does not touch forms of another store', async () => {
      await item('i1', 10);
      const other = await kind.create(
        [{ stockItemId: 'i1', quantity: 4, isInflow: true }],
        's2'
      );

      expect(await kind.remove('s1', [other])).toBe(0);

      expect(await level('i1')).toBe(14);
      expect(await find(other)).toBeDefined();
    });

    it('rolls the stock levels back when the delete fails', async () => {
      await item('i1', 10);
      const id = await kind.create([
        { stockItemId: 'i1', quantity: 4, isInflow: true },
      ]);
      vi.spyOn(collection as any, 'removeAsync').mockRejectedValueOnce(
        new Error('delete failed')
      );

      await expect(kind.remove('s1', [id])).rejects.toThrow('delete failed');

      expect(await level('i1')).toBe(14);
      expect(await find(id)).toBeDefined();
    });
  });

  describe('attachments', () => {
    it('detaches the attachment and deletes it', async () => {
      const id = await kind.create([]);
      await (collection as any).updateAsync(id, {
        $set: { attachmentIds: ['a1', 'a2'] },
      });
      await Attachments.insertAsync({ _id: 'a1', fileKey: 'k/a1.png' });

      await kind.removeAttachment(id, 's1', 'a1', 'editor');

      const form = await find(id);
      expect(form.attachmentIds).toEqual(['a2']);
      expect(form.updatedBy).toBe('editor');
      expect(await Attachments.findOneAsync('a1')).toBeUndefined();
    });

    it('does not detach from a form of another store', async () => {
      const id = await kind.create([]);
      await (collection as any).updateAsync(id, {
        $set: { attachmentIds: ['a1'] },
      });
      await Attachments.insertAsync({ _id: 'a1', fileKey: 'k/a1.png' });

      await kind.removeAttachment(id, 'other-store', 'a1', 'editor');

      expect((await find(id)).attachmentIds).toEqual(['a1']);
    });
  });
});
