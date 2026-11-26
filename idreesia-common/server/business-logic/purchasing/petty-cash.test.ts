import { describe, expect, it } from 'vitest';

import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import { People } from 'meteor/idreesia-common/server/collections/common';

import {
  approvePettyCashReplenishment,
  approvePettyCashVoucher,
  createPettyCashExpenseHead,
  createPettyCashFund,
  deletePettyCashExpenseHead,
  setPettyCashExpenseHeadActive,
  updatePettyCashExpenseHead,
  createPettyCashVoucher,
  deletePettyCashVoucher,
  listPettyCashExpenseHeads,
  getPettyCashFund,
  getPettyCashVoucher,
  listPettyCashVouchers,
  rejectPettyCashReplenishment,
  rejectPettyCashVoucher,
  requestPettyCashReplenishment,
  submitPettyCashVoucher,
  updatePettyCashFund,
  updatePettyCashVoucher,
  voidPettyCashVoucher,
} from './index';

const user = { _id: 'u1' };
const today = new Date(2030, 0, 10);

const newPerson = async () => {
  const _id = `person-${Math.random()}`;
  await People.insertAsync({ _id, sharedData: { name: 'Cash Keeper' } } as never);
  return _id;
};

const newFund = async (overrides: Record<string, unknown> = {}) =>
  createPettyCashFund(
    {
      name: `Fund ${Math.random()}`,
      custodianPersonId: await newPerson(),
      floatAmount: 1000,
      perTransactionLimit: 500,
      ...overrides,
    },
    user
  );

let headCounter = 0;
const newHead = (name = `Head ${(headCounter += 1)} ${Math.random()}`) => createPettyCashExpenseHead({ name }, user);

// A fresh head for vouchers that don't care which one they use (the database is reset between tests).
const headId = async () => (await newHead())._id;

const newStockItem = async (physicalStoreId: string, currentStockLevel = 0) =>
  (await StockItems.insertAsync({
    physicalStoreId,
    name: 'Bulb',
    categoryId: 'cat',
    unitOfMeasurement: 'pcs',
    startingStockLevel: currentStockLevel,
    currentStockLevel,
  })) as string;

const stockOf = async (_id: string) => (await StockItems.findOneAsync({ _id }))?.currentStockLevel;

const draft = async (fundId: string, lines = [{ description: 'Tea', quantity: 2, unitPrice: 50 }]) =>
  createPettyCashVoucher({ fundId, expenseHeadId: await headId(), voucherDate: today, payee: 'Shop', lines }, user);

const approved = async (fundId: string, price = 50) => {
  const v = await draft(fundId, [{ description: 'Tea', quantity: 1, unitPrice: price }]);
  await submitPettyCashVoucher(v._id, user);
  return approvePettyCashVoucher(v._id, user);
};

describe('petty cash funds', () => {
  it('starts with the balance at the float', async () => {
    const fund = await newFund();
    expect(fund.balance).toBe(1000);
    expect(fund.isActive).toBe(true);
  });

  it('needs a real custodian and a positive float', async () => {
    await expect(newFund({ custodianPersonId: 'nobody' })).rejects.toThrow(/person/);
    await expect(newFund({ floatAmount: 0 })).rejects.toThrow(/float/);
  });

  it('updates the settings without touching the balance', async () => {
    const fund = await newFund();
    const updated = await updatePettyCashFund(
      fund._id,
      { name: 'Renamed', custodianPersonId: fund.custodianPersonId, floatAmount: 2000 },
      user
    );
    expect(updated.name).toBe('Renamed');
    expect(updated.perTransactionLimit).toBeUndefined();
    expect(updated.balance).toBe(1000);
  });
});

describe('petty cash vouchers', () => {
  it('prices the lines and numbers the voucher', async () => {
    const fund = await newFund();
    const v = await draft(fund._id);
    expect(v.total).toBe(100);
    expect(v.number).toMatch(/^PCV-2030-\d{4}$/);
    expect(v.status).toBe('draft');
  });

  it('spends cash on approval and refuses an empty fund', async () => {
    const fund = await newFund({ floatAmount: 120, perTransactionLimit: undefined });
    await approved(fund._id, 100);
    expect((await getPettyCashFund(fund._id)).balance).toBe(20);

    const v = await draft(fund._id);
    await submitPettyCashVoucher(v._id, user);
    await expect(approvePettyCashVoucher(v._id, user)).rejects.toThrow(/not enough/);
    // The failed approval left nothing behind.
    expect((await getPettyCashVoucher(v._id)).status).toBe('submitted');
    expect((await getPettyCashFund(fund._id)).balance).toBe(20);
  });

  it('enforces the per-transaction limit when submitting', async () => {
    const fund = await newFund({ perTransactionLimit: 80 });
    const v = await draft(fund._id);
    await expect(submitPettyCashVoucher(v._id, user)).rejects.toThrow(/limit/);
  });

  it('adds stock only for lines that name a store item', async () => {
    const fund = await newFund();
    const itemId = await newStockItem('store-a', 5);
    const v = await createPettyCashVoucher(
      {
        fundId: fund._id,
        expenseHeadId: await headId(),
        voucherDate: today,
        lines: [
          { description: 'Bulb', quantity: 3, unitPrice: 10, physicalStoreId: 'store-a', externalCatalogId: itemId },
          { description: 'Tea', quantity: 1, unitPrice: 20 },
        ],
      },
      user
    );
    await submitPettyCashVoucher(v._id, user);
    await approvePettyCashVoucher(v._id, user);
    expect(await stockOf(itemId)).toBe(8);
    expect((await getPettyCashFund(fund._id)).balance).toBe(950);
  });

  it('rejects a stock item that is not in the named store', async () => {
    const fund = await newFund();
    const itemId = await newStockItem('store-a');
    await expect(
      createPettyCashVoucher(
        {
          fundId: fund._id,
          expenseHeadId: await headId(),
          voucherDate: today,
          lines: [{ description: 'Bulb', quantity: 1, unitPrice: 10, physicalStoreId: 'store-b', externalCatalogId: itemId }],
        },
        user
      )
    ).rejects.toThrow(/not one of the store/);
    await expect(
      draft(fund._id, [{ description: 'Bulb', quantity: 1, unitPrice: 10, physicalStoreId: 'store-a' } as never])
    ).rejects.toThrow(/both the store and the item/);
  });

  it('can be corrected after a rejection', async () => {
    const fund = await newFund();
    const v = await draft(fund._id);
    await submitPettyCashVoucher(v._id, user);
    await rejectPettyCashVoucher(v._id, 'Wrong amount', user);
    const fixed = await updatePettyCashVoucher(
      v._id,
      { expenseHeadId: await headId(), voucherDate: today, lines: [{ description: 'Tea', quantity: 1, unitPrice: 30 }] },
      user
    );
    expect(fixed.status).toBe('draft');
    expect(fixed.total).toBe(30);
  });

  it('refuses edits and deletes once submitted or approved', async () => {
    const fund = await newFund();
    const v = await draft(fund._id);
    await submitPettyCashVoucher(v._id, user);
    await expect(
      updatePettyCashVoucher(v._id, { expenseHeadId: await headId(), voucherDate: today, lines: [{ description: 'x', quantity: 1, unitPrice: 1 }] }, user)
    ).rejects.toThrow(/draft or rejected/);
    await expect(deletePettyCashVoucher(v._id, user)).rejects.toThrow(/draft/);
  });

  it('void restores the cash and takes stock back out', async () => {
    const fund = await newFund();
    const itemId = await newStockItem('store-a', 0);
    const v = await createPettyCashVoucher(
      {
        fundId: fund._id,
        expenseHeadId: await headId(),
        voucherDate: today,
        lines: [{ description: 'Bulb', quantity: 4, unitPrice: 25, physicalStoreId: 'store-a', externalCatalogId: itemId }],
      },
      user
    );
    await submitPettyCashVoucher(v._id, user);
    await approvePettyCashVoucher(v._id, user);
    await voidPettyCashVoucher(v._id, 'Bought twice', user);
    expect(await stockOf(itemId)).toBe(0);
    expect((await getPettyCashFund(fund._id)).balance).toBe(1000);
    expect((await getPettyCashVoucher(v._id)).status).toBe('voided');
  });

  it('cannot void once the stock was issued', async () => {
    const fund = await newFund();
    const itemId = await newStockItem('store-a', 0);
    const v = await createPettyCashVoucher(
      {
        fundId: fund._id,
        expenseHeadId: await headId(),
        voucherDate: today,
        lines: [{ description: 'Bulb', quantity: 4, unitPrice: 25, physicalStoreId: 'store-a', externalCatalogId: itemId }],
      },
      user
    );
    await submitPettyCashVoucher(v._id, user);
    await approvePettyCashVoucher(v._id, user);
    await StockItems.updateAsync({ _id: itemId }, { $set: { currentStockLevel: 1 } });
    await expect(voidPettyCashVoucher(v._id, 'Oops', user)).rejects.toThrow(/already been issued/);
    expect((await getPettyCashFund(fund._id)).balance).toBe(900);
  });
});

describe('petty cash replenishment', () => {
  it('bundles approved vouchers and refills the fund on approval', async () => {
    const fund = await newFund();
    const a = await approved(fund._id, 100);
    const b = await approved(fund._id, 60);
    expect((await getPettyCashFund(fund._id)).balance).toBe(840);

    const r = await requestPettyCashReplenishment({ fundId: fund._id, countedCash: 830 }, user);
    expect(r.amount).toBe(160);
    expect(r.variance).toBe(-10);
    expect(r.voucherIds.sort()).toEqual([a._id, b._id].sort());
    expect((await getPettyCashVoucher(a._id)).replenishmentId).toBe(r._id);

    // The same vouchers can't be bundled twice.
    await expect(requestPettyCashReplenishment({ fundId: fund._id }, user)).rejects.toThrow(/not in a replenishment/);
    await expect(voidPettyCashVoucher(a._id, 'Late', user)).rejects.toThrow(/replenishment/);

    await approvePettyCashReplenishment(r._id, user);
    expect((await getPettyCashFund(fund._id)).balance).toBe(1000);
    await expect(approvePettyCashReplenishment(r._id, user)).rejects.toThrow(/no longer/);
  });

  it('frees the vouchers when rejected', async () => {
    const fund = await newFund();
    await approved(fund._id, 100);
    const r = await requestPettyCashReplenishment({ fundId: fund._id }, user);
    await rejectPettyCashReplenishment(r._id, 'Receipts missing', user);
    expect((await getPettyCashFund(fund._id)).balance).toBe(900);

    const { data } = await listPettyCashVouchers({ fundId: fund._id, unreplenishedOnly: true });
    expect(data).toHaveLength(1);
    const again = await requestPettyCashReplenishment({ fundId: fund._id }, user);
    expect(again.amount).toBe(100);
  });

  it('only bundles vouchers of the chosen fund', async () => {
    const fund = await newFund();
    const other = await newFund();
    const v = await approved(other._id, 50);
    await expect(requestPettyCashReplenishment({ fundId: fund._id, voucherIds: [v._id] }, user)).rejects.toThrow(
      /not in a replenishment/
    );
  });
});

describe('petty cash expense heads', () => {
  it('creates, renames and lists heads, ignoring case in names', async () => {
    const a = await newHead('Stationery Test');
    expect(a.isActive).toBe(true);
    await expect(newHead('stationery test')).rejects.toThrow(/already exists/);
    const renamed = await updatePettyCashExpenseHead(a._id, { name: 'Stationery Test 2', description: 'Pens' }, user);
    expect(renamed.name).toBe('Stationery Test 2');
    expect(renamed.description).toBe('Pens');
    const cleared = await updatePettyCashExpenseHead(a._id, { name: 'Stationery Test 2' }, user);
    expect(cleared.description).toBeUndefined();
    const { data } = await listPettyCashExpenseHeads({ search: 'stationery test 2' });
    expect(data.map((h) => h._id)).toEqual([a._id]);
    await expect(updatePettyCashExpenseHead(a._id, { name: '  ' }, user)).rejects.toThrow(/name/);
  });

  it('refuses a voucher without a usable head', async () => {
    const fund = await newFund();
    const lines = [{ description: 'Tea', quantity: 1, unitPrice: 10 }];
    await expect(
      createPettyCashVoucher({ fundId: fund._id, expenseHeadId: 'nope', voucherDate: today, lines }, user)
    ).rejects.toThrow(/not found/);
    const head = await newHead();
    await setPettyCashExpenseHeadActive(head._id, false, user);
    await expect(
      createPettyCashVoucher({ fundId: fund._id, expenseHeadId: head._id, voucherDate: today, lines }, user)
    ).rejects.toThrow(/not active/);
  });

  it('books a voucher to one head, can change it, and filters by it', async () => {
    const fund = await newFund();
    const first = await newHead();
    const second = await newHead();
    const lines = [{ description: 'Tea', quantity: 1, unitPrice: 10 }];
    const v = await createPettyCashVoucher(
      { fundId: fund._id, expenseHeadId: first._id, voucherDate: today, lines },
      user
    );
    expect(v.expenseHeadId).toBe(first._id);
    const moved = await updatePettyCashVoucher(v._id, { expenseHeadId: second._id, voucherDate: today, lines }, user);
    expect(moved.expenseHeadId).toBe(second._id);
    expect((await listPettyCashVouchers({ expenseHeadId: first._id })).data).toHaveLength(0);
    expect((await listPettyCashVouchers({ expenseHeadId: second._id })).data.map((x) => x._id)).toEqual([v._id]);
  });

  it('lets a draft keep a head that was deactivated, but not move to an inactive one', async () => {
    const fund = await newFund();
    const head = await newHead();
    const other = await newHead();
    const lines = [{ description: 'Tea', quantity: 1, unitPrice: 10 }];
    const v = await createPettyCashVoucher(
      { fundId: fund._id, expenseHeadId: head._id, voucherDate: today, lines },
      user
    );
    await setPettyCashExpenseHeadActive(head._id, false, user);
    await setPettyCashExpenseHeadActive(other._id, false, user);
    await expect(
      updatePettyCashVoucher(v._id, { expenseHeadId: head._id, voucherDate: today, lines }, user)
    ).resolves.toBeTruthy();
    await expect(
      updatePettyCashVoucher(v._id, { expenseHeadId: other._id, voucherDate: today, lines }, user)
    ).rejects.toThrow(/not active/);
  });

  it('deletes only a head no voucher uses', async () => {
    const fund = await newFund();
    const used = await newHead();
    const unused = await newHead();
    await createPettyCashVoucher(
      { fundId: fund._id, expenseHeadId: used._id, voucherDate: today, lines: [{ description: 'Tea', quantity: 1, unitPrice: 10 }] },
      user
    );
    await expect(deletePettyCashExpenseHead(used._id, user)).rejects.toThrow(/Deactivate/);
    await expect(deletePettyCashExpenseHead(unused._id, user)).resolves.toBe(true);
    await expect(deletePettyCashExpenseHead(unused._id, user)).rejects.toThrow(/not found/);
  });
});
