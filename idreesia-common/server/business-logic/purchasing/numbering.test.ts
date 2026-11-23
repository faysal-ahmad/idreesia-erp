import { describe, expect, it } from 'vitest';

import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { PurchasingCounters } from 'meteor/idreesia-common/server/collections/purchasing';

import { nextDocumentNumber } from './index';

describe('purchasing document numbers', () => {
  it('counts up per type and year, padded', async () => {
    const d = new Date(2031, 5, 1);
    expect(await nextDocumentNumber('PO', d)).toBe('PO-2031-0001');
    expect(await nextDocumentNumber('PO', d)).toBe('PO-2031-0002');
    expect(await nextDocumentNumber('PR', d)).toBe('PR-2031-0001');
    expect(await nextDocumentNumber('PO', new Date(2032, 0, 1))).toBe('PO-2032-0001');
  });

  it('hands out distinct numbers to concurrent callers', async () => {
    const d = new Date(2033, 0, 1);
    const numbers = await Promise.all(
      Array.from({ length: 8 }, () =>
        runInTransaction(() => nextDocumentNumber('GRN', d))
      )
    );
    expect(new Set(numbers).size).toBe(8);
  });

  it('leaves no gap when the transaction fails', async () => {
    const d = new Date(2034, 0, 1);
    await expect(
      runInTransaction(async () => {
        await nextDocumentNumber('INV', d);
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');
    expect(await nextDocumentNumber('INV', d)).toBe('INV-2034-0001');
    expect(await PurchasingCounters.find({ type: 'INV', year: 2034 }).countAsync()).toBe(1);
  });
});
