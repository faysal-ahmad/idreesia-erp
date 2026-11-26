import { describe, expect, it } from 'vitest';

import { PhysicalStores, StockItems } from 'meteor/idreesia-common/server/collections/inventory';
import {
  PurchasingOrders,
  PurchasingReceipts,
  PurchasingRequisitions,
} from 'meteor/idreesia-common/server/collections/purchasing';

import {
  approveOrder,
  approveRequisition,
  cancelOrder,
  cancelRequisition,
  closeOrder,
  closeRequisition,
  createInvoice,
  createOrderFromQuote,
  createOrderFromRequisition,
  createQuote,
  createRequisition,
  createVendor,
  deleteRequisition,
  getInvoice,
  getOrder,
  getReceipt,
  getRequisition,
  listRequestedForValues,
  postReceipt,
  submitOrder,
  submitRequisition,
  updateOrder,
  updateQuote,
  updateRequisition,
  voidInvoice,
  voidReceipt,
} from './index';

const user = { _id: 'u1' };
const today = new Date(2030, 0, 10);
const storeA = { physicalStoreId: 'store-a' };
const storeB = { physicalStoreId: 'store-b' };

const newVendor = (name: string) => createVendor({ name: `${name} ${Math.random()}`, paymentTermsDays: 30 }, user);

const newStockItem = async (physicalStoreId: string, name: string, currentStockLevel = 0) => {
  const _id = await StockItems.insertAsync({
    physicalStoreId,
    name,
    categoryId: 'cat',
    unitOfMeasurement: 'kg',
    startingStockLevel: currentStockLevel,
    currentStockLevel,
  });
  return _id as string;
};

const stockOf = async (_id: string) => (await StockItems.findOneAsync({ _id }))?.currentStockLevel;

const approve = async (requisitionId: string) => {
  await submitRequisition(requisitionId, user, undefined);
  return approveRequisition(requisitionId, user);
};

/** An approved requisition of the store for the given quantities of one new stock item each. */
const storeRequisition = async (origin = storeA, quantities = [10], price = 5) => {
  const itemIds: string[] = [];
  for (const [i] of quantities.entries()) {
    itemIds.push(await newStockItem(origin.physicalStoreId, `Item ${i} ${Math.random()}`));
  }
  const draft = await createRequisition(
    {
      title: 'Store needs',
      lines: quantities.map((quantity, i) => ({
        externalCatalogId: itemIds[i],
        quantity,
        estimatedUnitPrice: price,
      })),
    },
    user,
    origin
  );
  await submitRequisition(draft._id, user, origin);
  const requisition = await approveRequisition(draft._id, user);
  return { requisition, itemIds };
};

/** A purchasing requisition for the given quantities of free-text items, approved. */
const purchasingRequisition = async (quantities = [10], price = 5) => {
  const draft = await createRequisition(
    {
      title: 'Purchasing needs',
      lines: quantities.map((quantity, i) => ({
        description: `Thing ${i}`,
        unit: 'pc',
        quantity,
        estimatedUnitPrice: price,
      })),
    },
    user
  );
  await approve(draft._id);
  return getRequisition(draft._id);
};

/** An approved order from the requisition; the vendor is new unless given. */
const approvedOrderOf = async (requisitionId: string, vendorId?: string) => {
  const vid = vendorId ?? (await newVendor('Vendor'))._id;
  const draft = await createOrderFromRequisition(requisitionId, vid, user);
  await submitOrder(draft._id, user);
  await approveOrder(draft._id, user);
  return getOrder(draft._id);
};

const receiveAll = (order: Awaited<ReturnType<typeof getOrder>>, origin?: { physicalStoreId: string }) =>
  postReceipt(
    {
      orderId: order._id,
      receivedDate: today,
      lines: order.lines.map((l) => ({ orderLineId: l._id, receivedQuantity: l.quantity })),
    },
    user,
    origin
  );

describe('store requisitions', () => {
  it('only takes the store\'s own stock items', async () => {
    const mine = await newStockItem('store-a', 'Rice');
    const theirs = await newStockItem('store-b', 'Flour');

    const requisition = await createRequisition(
      { title: 'Rice', lines: [{ externalCatalogId: mine, quantity: 5 }] },
      user,
      storeA
    );
    expect(requisition).toMatchObject({ source: 'store', externalSourceId: 'store-a', status: 'draft' });
    expect(requisition.lines[0]).toMatchObject({ externalCatalogId: mine, description: 'Rice', unit: 'kg' });

    const bad = [
      [{ description: 'Free text', unit: 'pc', quantity: 1 }], // not a stock item
      [{ externalCatalogId: theirs, quantity: 1 }], // another store's item
      [{ externalCatalogId: 'missing', quantity: 1 }],
    ];
    for (const lines of bad) {
      await expect(createRequisition({ title: 'X', lines }, user, storeA)).rejects.toMatchObject({
        extensions: { code: 'BAD_USER_INPUT' },
      });
    }
    // A purchasing requisition can't carry a store item.
    await expect(
      createRequisition({ title: 'X', lines: [{ externalCatalogId: mine, description: 'Rice', unit: 'kg', quantity: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('is worked on only by the store that raised it', async () => {
    const item = await newStockItem('store-a', 'Sugar');
    const draft = await createRequisition({ title: 'Sugar', lines: [{ externalCatalogId: item, quantity: 2 }] }, user, storeA);
    const values = { title: 'Changed', lines: [{ externalCatalogId: item, quantity: 3 }] };

    // Another store can't even see it.
    await expect(getRequisition(draft._id, storeB)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    const itemB = await newStockItem('store-b', 'Sugar B');
    await expect(
      updateRequisition(draft._id, draft.version, { title: 'Changed', lines: [{ externalCatalogId: itemB, quantity: 3 }] }, user, storeB)
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(submitRequisition(draft._id, user, storeB)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(cancelRequisition(draft._id, user, storeB)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(deleteRequisition(draft._id, user, storeB)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });

    // Purchasing can't change a store's draft either.
    await expect(
      updateRequisition(draft._id, draft.version, { title: 'Changed', lines: [{ description: 'A', unit: 'pc', quantity: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await expect(submitRequisition(draft._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await expect(deleteRequisition(draft._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    // The store can.
    const updated = await updateRequisition(draft._id, draft.version, values, user, storeA);
    expect(updated.lines[0].quantity).toBe(3);
    expect((await submitRequisition(draft._id, user, storeA)).status).toBe('submitted');
    // ...and purchasing approves it.
    expect((await approveRequisition(draft._id, user)).status).toBe('approved');
  });

  it('is requested for the store, by name, whatever the store sends', async () => {
    const physicalStoreId = (await PhysicalStores.insertAsync({ name: 'Langar Store' } as never)) as string;
    const origin = { physicalStoreId };
    const item = await newStockItem(physicalStoreId, 'Salt');
    const lines = [{ externalCatalogId: item, quantity: 1 }];

    const draft = await createRequisition({ title: 'Salt', requestedFor: 'Someone else', lines }, user, origin);
    expect(draft.requestedFor).toBe('Langar Store');
    const updated = await updateRequisition(draft._id, draft.version, { title: 'Salt', lines }, user, origin);
    expect(updated.requestedFor).toBe('Langar Store');

    // Purchasing types its own, and both are suggested.
    const own = await createRequisition(
      { title: 'P', requestedFor: '  Kitchen  ', lines: [{ description: 'A', unit: 'pc', quantity: 1 }] },
      user
    );
    expect(own.requestedFor).toBe('Kitchen');
    expect(await listRequestedForValues()).toEqual(expect.arrayContaining(['Kitchen', 'Langar Store']));
  });

  it('a store can\'t update a purchasing draft', async () => {
    const draft = await createRequisition({ title: 'P', lines: [{ description: 'A', unit: 'pc', quantity: 1 }] }, user);
    await expect(submitRequisition(draft._id, user, storeA)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });
});

describe('source fields', () => {
  it('are never stored on purchasing documents', async () => {
    const requisition = await purchasingRequisition();
    const order = await approvedOrderOf(requisition._id);
    const receipt = await receiveAll(order);

    for (const [collection, _id] of [
      [PurchasingRequisitions, requisition._id],
      [PurchasingOrders, order._id],
      [PurchasingReceipts, receipt._id],
    ] as const) {
      const rawCollection = collection.rawCollection() as unknown as {
        findOne(query: object): Promise<Record<string, unknown>>;
      };
      const raw = await rawCollection.findOne({ _id });
      expect('source' in raw).toBe(false);
      expect('externalSourceId' in raw).toBe(false);
    }
  });
});

describe('store orders and receiving', () => {
  it('copies the store item, requisition line and source onto the order', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10, 4]);
    const order = await createOrderFromRequisition(requisition._id, (await newVendor('V'))._id, user);
    expect(order).toMatchObject({ source: 'store', externalSourceId: 'store-a', requisitionId: requisition._id });
    expect(order.lines.map((l) => [l.externalCatalogId, l.requisitionLineId])).toEqual(
      requisition.lines.map((l, i) => [itemIds[i], l._id])
    );
  });

  it('adds only the accepted quantity to the store\'s stock, and the receipt carries the store item', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10]);
    const order = await approvedOrderOf(requisition._id);

    const receipt = await postReceipt(
      {
        orderId: order._id,
        receivedDate: today,
        lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 6, rejectedQuantity: 2 }],
      },
      user,
      storeA
    );
    expect(receipt).toMatchObject({ source: 'store', externalSourceId: 'store-a' });
    expect(receipt.lines[0]).toMatchObject({ externalCatalogId: itemIds[0], receivedQuantity: 6, rejectedQuantity: 2 });
    expect(await stockOf(itemIds[0])).toBe(6);

    await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 4 }] },
      user,
      storeA
    );
    expect(await stockOf(itemIds[0])).toBe(10);
    expect((await getOrder(order._id)).status).toBe('received');
  });

  it('is received only by its own store', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10]);
    const order = await approvedOrderOf(requisition._id);
    const lines = [{ orderLineId: order.lines[0]._id, receivedQuantity: 3 }];

    await expect(postReceipt({ orderId: order._id, receivedDate: today, lines }, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    await expect(postReceipt({ orderId: order._id, receivedDate: today, lines }, user, storeB)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    expect(await stockOf(itemIds[0])).toBe(0);
    expect((await getOrder(order._id)).lines[0].receivedQuantity).toBe(0);

    // And a store can't receive purchasing's orders.
    const own = await approvedOrderOf((await purchasingRequisition())._id);
    await expect(
      postReceipt(
        { orderId: own._id, receivedDate: today, lines: [{ orderLineId: own.lines[0]._id, receivedQuantity: 1 }] },
        user,
        storeA
      )
    ).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
  });

  it('voiding takes the stock back, by the store only, and is refused once it was issued', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10]);
    const order = await approvedOrderOf(requisition._id);
    const receipt = await receiveAll(order, storeA);
    expect(await stockOf(itemIds[0])).toBe(10);

    await expect(getReceipt(receipt._id, storeB)).rejects.toMatchObject({ extensions: { code: 'NOT_FOUND' } });
    await expect(voidReceipt(receipt._id, 'Oops', user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await expect(voidReceipt(receipt._id, 'Oops', user, storeB)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });

    // Some of it is issued: 4 left in stock, 10 to take back.
    await StockItems.updateAsync({ _id: itemIds[0] }, { $set: { currentStockLevel: 4 } });
    await expect(voidReceipt(receipt._id, 'Oops', user, storeA)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    expect(await stockOf(itemIds[0])).toBe(4);
    expect((await getReceipt(receipt._id)).status).toBe('posted');
    expect((await getOrder(order._id)).lines[0].receivedQuantity).toBe(10);

    await StockItems.updateAsync({ _id: itemIds[0] }, { $set: { currentStockLevel: 12 } });
    expect((await voidReceipt(receipt._id, 'Oops', user, storeA)).status).toBe('voided');
    expect(await stockOf(itemIds[0])).toBe(2);
    expect((await getOrder(order._id)).lines[0].receivedQuantity).toBe(0);
  });
});

describe('requisition closing', () => {
  it('closes when every order is received, and reopens on a void or a new order', async () => {
    const requisition = await purchasingRequisition([10]);
    const order = await approvedOrderOf(requisition._id);
    expect((await getRequisition(requisition._id)).status).toBe('ordered');

    const part = await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 4 }] },
      user
    );
    expect((await getRequisition(requisition._id)).status).toBe('ordered');

    const rest = await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 6 }] },
      user
    );
    expect((await getRequisition(requisition._id)).status).toBe('closed');

    await voidReceipt(rest._id, 'Wrong', user);
    expect((await getRequisition(requisition._id)).status).toBe('ordered');
    await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 6 }] },
      user
    );
    expect((await getRequisition(requisition._id)).status).toBe('closed');

    // A new order from a closed requisition reopens it.
    const second = await createOrderFromRequisition(requisition._id, (await newVendor('V2'))._id, user);
    expect((await getRequisition(requisition._id)).status).toBe('ordered');
    // ...and a cancelled order doesn't hold it open.
    await cancelOrder(second._id, user);
    expect((await getRequisition(requisition._id)).status).toBe('closed');
    expect(part.status).toBe('posted');
  });

  it('waits for every order of the requisition, and a closed order counts as done', async () => {
    const requisition = await purchasingRequisition([10]);
    const first = await approvedOrderOf(requisition._id);
    const second = await approvedOrderOf(requisition._id);

    await receiveAll(first);
    expect((await getRequisition(requisition._id)).status).toBe('ordered');
    await receiveAll(second);
    expect((await getRequisition(requisition._id)).status).toBe('closed');

    await closeOrder(first._id, user);
    expect((await getRequisition(requisition._id)).status).toBe('closed');
  });

  it('can be closed by hand once ordered, and not before', async () => {
    const requisition = await purchasingRequisition([10]);
    await expect(closeRequisition(requisition._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await approvedOrderOf(requisition._id);
    expect((await closeRequisition(requisition._id, user)).status).toBe('closed');
  });
});

describe('orders come from requisition lines', () => {
  const edit = (order: Awaited<ReturnType<typeof getOrder>>, lines: object[]) =>
    updateOrder(order._id, order.version, { vendorId: order.vendorId, orderDate: order.orderDate, lines: lines as never }, user);

  it('lets the price, tax and a lower quantity change, and nothing else', async () => {
    const requisition = await purchasingRequisition([10, 5]);
    const order = await createOrderFromRequisition(requisition._id, (await newVendor('V'))._id, user);
    const [a, b] = order.lines;

    const edited = await edit(order, [
      { ...a, quantity: 8, unitPrice: 7, taxRate: 5, description: 'Renamed', unit: 'kg' },
      { ...b, unitPrice: 9 },
    ]);
    expect(edited.lines[0]).toMatchObject({
      _id: a._id,
      quantity: 8,
      unitPrice: 7,
      taxRate: 5,
      description: a.description,
      unit: a.unit,
      requisitionLineId: a.requisitionLineId,
    });
    expect(edited.lines[1].unitPrice).toBe(9);

    // More than requested.
    await expect(edit(edited, [{ ...a, quantity: 11 }, b])).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    // Removing, adding.
    await expect(edit(edited, [a])).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      edit(edited, [a, b, { description: 'Extra', unit: 'pc', quantity: 1, unitPrice: 1 }])
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    // A line that isn't the order's.
    await expect(edit(edited, [{ ...a, _id: 'other' }, b])).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    // The same line twice.
    await expect(edit(edited, [a, { ...a }])).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('keeps a store order\'s stock item whatever the edit says', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10]);
    const order = await createOrderFromRequisition(requisition._id, (await newVendor('V'))._id, user);
    const edited = await edit(order, [{ ...order.lines[0], externalCatalogId: 'someone-else', unitPrice: 3 }]);
    expect(edited.lines[0]).toMatchObject({ externalCatalogId: itemIds[0], unitPrice: 3 });
  });
});

describe('quotes', () => {
  it('are for a requisition, and price its lines', async () => {
    const requisition = await purchasingRequisition([10, 5]);
    const vendor = await newVendor('Quote Co');
    const quote = (extra: object) =>
      createQuote(
        {
          requisitionId: requisition._id,
          vendorId: vendor._id,
          quoteDate: today,
          lines: [{ requisitionLineId: requisition.lines[0]._id, quantity: 10, unitPrice: 4 }],
          ...extra,
        },
        user
      );
    const bad = async (extra: object) =>
      expect(quote(extra)).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });

    await bad({ requisitionId: '' });
    await bad({ requisitionId: 'missing' });
    await bad({ lines: [{ requisitionLineId: 'nope', quantity: 1, unitPrice: 1 }] });
    await bad({ lines: [{ quantity: 1, unitPrice: 1 }] });
    await bad({ lines: [{ requisitionLineId: requisition.lines[0]._id, quantity: 11, unitPrice: 1 }] });
    await bad({
      lines: [
        { requisitionLineId: requisition.lines[0]._id, quantity: 1, unitPrice: 1 },
        { requisitionLineId: requisition.lines[0]._id, quantity: 1, unitPrice: 1 },
      ],
    });

    // Pricing some of the lines is fine; the item is the requisition's.
    const ok = await quote({
      lines: [{ requisitionLineId: requisition.lines[1]._id, quantity: 3, unitPrice: 8, description: 'Other' }],
    });
    expect(ok.lines[0]).toMatchObject({
      requisitionLineId: requisition.lines[1]._id,
      description: requisition.lines[1].description,
      quantity: 3,
    });
    expect(ok.total).toBe(24);

    const edited = await updateQuote(
      ok._id,
      ok.version,
      {
        requisitionId: requisition._id,
        vendorId: vendor._id,
        quoteDate: today,
        lines: [{ requisitionLineId: requisition.lines[1]._id, quantity: 5, unitPrice: 8 }],
      },
      user
    );
    expect(edited.total).toBe(40);
  });

  it('make a store order that keeps the stock item', async () => {
    const { requisition, itemIds } = await storeRequisition(storeA, [10]);
    const vendor = await newVendor('Quote Store Co');
    const quote = await createQuote(
      {
        requisitionId: requisition._id,
        vendorId: vendor._id,
        quoteDate: today,
        lines: [{ requisitionLineId: requisition.lines[0]._id, quantity: 10, unitPrice: 4 }],
      },
      user
    );
    const order = await createOrderFromQuote(quote._id, user);
    expect(order).toMatchObject({ source: 'store', externalSourceId: 'store-a', total: 40 });
    expect(order.lines[0]).toMatchObject({ externalCatalogId: itemIds[0], requisitionLineId: requisition.lines[0]._id });
    expect((await getRequisition(requisition._id)).status).toBe('ordered');
  });
});

describe('invoices over several orders', () => {
  const received = async (vendorId: string, quantity = 10) => {
    const requisition = await purchasingRequisition([quantity], 10);
    const order = await approvedOrderOf(requisition._id, vendorId);
    await receiveAll(order);
    return getOrder(order._id);
  };

  const billLine = (order: Awaited<ReturnType<typeof getOrder>>, quantity: number) => ({
    orderId: order._id,
    orderLineId: order.lines[0]._id,
    quantity,
    unitPrice: 10,
  });

  it('bills each order\'s line, and voiding puts both back', async () => {
    const vendor = await newVendor('Two Orders Co');
    const first = await received(vendor._id);
    const second = await received(vendor._id, 6);

    const invoice = await createInvoice(
      { vendorId: vendor._id, vendorInvoiceNo: 'TWO-1', invoiceDate: today, lines: [billLine(first, 10), billLine(second, 6)] },
      user
    );
    expect(invoice.orderIds?.slice().sort()).toEqual([first._id, second._id].sort());
    expect(invoice.lines.map((l) => l.orderId)).toEqual([first._id, second._id]);
    expect(invoice.total).toBe(160);
    expect((await getOrder(first._id)).lines[0].invoicedQuantity).toBe(10);
    expect((await getOrder(second._id)).lines[0].invoicedQuantity).toBe(6);

    await voidInvoice(invoice._id, user);
    expect((await getOrder(first._id)).lines[0].invoicedQuantity).toBe(0);
    expect((await getOrder(second._id)).lines[0].invoicedQuantity).toBe(0);
    expect((await getInvoice(invoice._id)).status).toBe('voided');
  });

  it('checks over-billing line by line, leaving every order untouched on refusal', async () => {
    const vendor = await newVendor('Over Co');
    const first = await received(vendor._id);
    const second = await received(vendor._id, 6);

    const values = {
      vendorId: vendor._id,
      vendorInvoiceNo: 'OVER-1',
      invoiceDate: today,
      lines: [billLine(first, 10), billLine(second, 7)], // 1 more than the second's 6
    };
    await expect(createInvoice(values, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    expect((await getOrder(first._id)).lines[0].invoicedQuantity).toBe(0);
    expect((await getOrder(second._id)).lines[0].invoicedQuantity).toBe(0);

    const disputed = await createInvoice({ ...values, allowOverBilling: true }, user);
    expect(disputed.isDisputed).toBe(true);
  });

  it('adds up a line billed twice on one invoice, and refuses bad lines', async () => {
    const vendor = await newVendor('Twice Co');
    const order = await received(vendor._id, 10);
    await expect(
      createInvoice(
        { vendorId: vendor._id, vendorInvoiceNo: 'T-1', invoiceDate: today, lines: [billLine(order, 6), billLine(order, 6)] },
        user
      )
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    const noOrder = { orderLineId: order.lines[0]._id, quantity: 1, unitPrice: 10 };
    await expect(
      createInvoice({ vendorId: vendor._id, vendorInvoiceNo: 'T-2', invoiceDate: today, lines: [noOrder as never] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      createInvoice(
        { vendorId: vendor._id, vendorInvoiceNo: 'T-3', invoiceDate: today, lines: [{ ...billLine(order, 1), orderLineId: 'nope' }] },
        user
      )
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('refuses an order of another vendor', async () => {
    const vendor = await newVendor('Mine Co');
    const mine = await received(vendor._id);
    const theirs = await received((await newVendor('Theirs Co'))._id);
    await expect(
      createInvoice(
        { vendorId: vendor._id, vendorInvoiceNo: 'X-1', invoiceDate: today, lines: [billLine(mine, 1), billLine(theirs, 1)] },
        user
      )
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect((await getOrder(mine._id)).lines[0].invoicedQuantity).toBe(0);
  });
});
