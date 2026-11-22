import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  PurchasingCatalogItems,
  PurchasingOrders,
  PurchasingReceipts,
} from 'meteor/idreesia-common/server/collections/purchasing';

import {
  approveOrder,
  approveRequisition,
  cancelOrder,
  cancelRequisition,
  closeOrder,
  createCatalogItem,
  createInvoice,
  createOrder,
  createOrderFromQuote,
  createOrderFromRequisition,
  createQuote,
  createRequisition,
  createVendor,
  deleteCatalogItem,
  deleteVendor,
  getInvoice,
  getOrder,
  getRequisition,
  listInvoices,
  listOrders,
  markOrderSent,
  postPayment,
  postReceipt,
  rejectOrder,
  rejectRequisition,
  reopenRequisition,
  selectQuote,
  setInvoiceDisputed,
  submitOrder,
  submitRequisition,
  updateOrder,
  updateRequisition,
  voidInvoice,
  voidPayment,
  voidReceipt,
  getQuote,
} from './index';

const user = { _id: 'u1' };
const today = new Date(2030, 0, 10);

const newVendor = (name: string, paymentTermsDays?: number) =>
  createVendor({ name, paymentTermsDays }, user);

const newRequisition = async (extra: Partial<Parameters<typeof createRequisition>[0]> = {}) =>
  createRequisition(
    {
      title: 'Office supplies',
      lines: [
        { description: 'Paper', unit: 'ream', quantity: 10, estimatedUnitPrice: 100 },
        { description: 'Pens', unit: 'box', quantity: 5, estimatedUnitPrice: 50 },
      ],
      ...extra,
    },
    user
  );

const approvedRequisition = async () => {
  const requisition = await newRequisition();
  await submitRequisition(requisition._id, user);
  await approveRequisition(requisition._id, user);
  return requisition;
};

/** A priced, approved, sent order for 10 paper at 100 and 5 pens at 50. */
const approvedOrder = async (vendorName: string) => {
  const vendor = await newVendor(vendorName, 30);
  const order = await createOrder(
    {
      vendorId: vendor._id,
      orderDate: today,
      lines: [
        { description: 'Paper', unit: 'ream', quantity: 10, unitPrice: 100, taxRate: 10 },
        { description: 'Pens', unit: 'box', quantity: 5, unitPrice: 50 },
      ],
    },
    user
  );
  await submitOrder(order._id, user);
  await approveOrder(order._id, user);
  return { vendor, order: await getOrder(order._id) };
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('requisitions', () => {
  it('numbers a draft, totals its lines and moves through approval', async () => {
    const requisition = await newRequisition();
    expect(requisition.number).toMatch(/^PR-\d{4}-\d{4}$/);
    expect(requisition.status).toBe('draft');
    expect(requisition.estimatedTotal).toBe(1250);

    expect((await submitRequisition(requisition._id, user)).status).toBe('submitted');
    const approved = await approveRequisition(requisition._id, user);
    expect(approved.status).toBe('approved');
    expect(approved.approvedBy).toBe('u1');
  });

  it('lets the same user submit and approve, since access is by permission only', async () => {
    const requisition = await newRequisition();
    await submitRequisition(requisition._id, user);
    await expect(approveRequisition(requisition._id, user)).resolves.toMatchObject({ status: 'approved' });
  });

  it('only edits a draft, and refuses a stale version', async () => {
    const requisition = await newRequisition();
    const values = { title: 'New title', lines: [{ description: 'Ink', unit: 'pc', quantity: 1 }] };
    const updated = await updateRequisition(requisition._id, requisition.version, values, user);
    expect(updated.title).toBe('New title');
    expect(updated.version).toBe(requisition.version + 1);

    await expect(
      updateRequisition(requisition._id, requisition.version, values, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    await submitRequisition(requisition._id, user);
    await expect(
      updateRequisition(requisition._id, updated.version + 1, values, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('rejects with a reason, reopens, and cancels', async () => {
    const requisition = await newRequisition();
    await submitRequisition(requisition._id, user);
    await expect(rejectRequisition(requisition._id, ' ', user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    const rejected = await rejectRequisition(requisition._id, 'Too costly', user);
    expect(rejected.rejectionReason).toBe('Too costly');
    expect((await reopenRequisition(requisition._id, user)).status).toBe('draft');
    expect((await cancelRequisition(requisition._id, user)).status).toBe('cancelled');
    await expect(submitRequisition(requisition._id, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
  });

  it('validates lines: a free-text line needs a description, a catalog line fills it in', async () => {
    await expect(
      createRequisition({ title: 'X', lines: [{ unit: 'kg', quantity: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(
      createRequisition({ title: 'X', lines: [{ description: 'A', unit: 'kg', quantity: 0 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    await expect(createRequisition({ title: 'X', lines: [] }, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });

    const item = await createCatalogItem({ name: 'Cat Rice', unit: 'kg' }, user);
    const requisition = await createRequisition(
      { title: 'Rice', lines: [{ catalogItemId: item._id, quantity: 20 }] },
      user
    );
    expect(requisition.lines[0]).toMatchObject({ description: 'Cat Rice', unit: 'kg', catalogItemId: item._id });
  });
});

describe('quotes and orders from them', () => {
  it('selecting one quote rejects the other open quotes of the requisition', async () => {
    const requisition = await approvedRequisition();
    const a = await newVendor('Quote A');
    const b = await newVendor('Quote B');
    const lines = [{ description: 'Paper', unit: 'ream', quantity: 10, unitPrice: 90 }];
    const qa = await createQuote({ requisitionId: requisition._id, vendorId: a._id, quoteDate: today, lines }, user);
    const qb = await createQuote({ requisitionId: requisition._id, vendorId: b._id, quoteDate: today, lines }, user);

    await selectQuote(qb._id, user);
    expect((await getQuote(qa._id)).status).toBe('rejected');
    expect((await getQuote(qb._id)).status).toBe('selected');
    await expect(selectQuote(qa._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('creates an order from a quote, linking and ordering the requisition', async () => {
    const requisition = await approvedRequisition();
    const vendor = await newVendor('Quote Order Co');
    const quote = await createQuote(
      {
        requisitionId: requisition._id,
        vendorId: vendor._id,
        quoteDate: today,
        lines: [{ description: 'Paper', unit: 'ream', quantity: 10, unitPrice: 90 }],
      },
      user
    );
    const order = await createOrderFromQuote(quote._id, user);
    expect(order).toMatchObject({ status: 'draft', quoteId: quote._id, requisitionId: requisition._id, total: 900 });
    expect((await getQuote(quote._id)).status).toBe('selected');
    expect((await getRequisition(requisition._id)).status).toBe('ordered');
  });
});

describe('purchase orders', () => {
  it('creates a draft from an approved requisition and releases it when cancelled', async () => {
    const requisition = await approvedRequisition();
    const vendor = await newVendor('Req Order Co', 15);
    const order = await createOrderFromRequisition(requisition._id, vendor._id, user);
    expect(order.number).toMatch(/^PO-\d{4}-\d{4}$/);
    expect(order.paymentTermsDays).toBe(15);
    expect(order.total).toBe(1250);
    expect((await getRequisition(requisition._id)).status).toBe('ordered');

    await cancelOrder(order._id, user);
    expect((await getRequisition(requisition._id)).status).toBe('approved');
  });

  it('refuses an order from a requisition that is not approved', async () => {
    const requisition = await newRequisition();
    const vendor = await newVendor('Unapproved Co');
    await expect(createOrderFromRequisition(requisition._id, vendor._id, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    // The failed attempt leaves nothing behind.
    expect(await PurchasingOrders.find({ requisitionId: requisition._id }).countAsync()).toBe(0);
  });

  it('computes tax, discount and shipping, and refuses a discount above the total', async () => {
    const vendor = await newVendor('Totals Co');
    const base = {
      vendorId: vendor._id,
      orderDate: today,
      lines: [{ description: 'Paper', unit: 'ream', quantity: 10, unitPrice: 100, taxRate: 10 }],
    };
    const order = await createOrder({ ...base, discount: 50, shipping: 20 }, user);
    expect(order).toMatchObject({ subtotal: 1000, taxTotal: 100, total: 1070 });
    await expect(createOrder({ ...base, discount: 5000 }, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
  });

  it('follows draft → pending → approved → sent, and a returned order can be edited again', async () => {
    const vendor = await newVendor('Flow Co');
    const order = await createOrder(
      { vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 1, unitPrice: 10 }] },
      user
    );
    await submitOrder(order._id, user);
    await expect(
      updateOrder(order._id, order.version + 1, { vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 2, unitPrice: 10 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    const returned = await rejectOrder(order._id, 'Wrong price', user);
    expect(returned).toMatchObject({ status: 'draft', rejectionReason: 'Wrong price' });
    const edited = await updateOrder(order._id, returned.version, { vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 2, unitPrice: 12 }] }, user);
    expect(edited.total).toBe(24);

    await submitOrder(order._id, user);
    await approveOrder(order._id, user);
    expect((await markOrderSent(order._id, user)).status).toBe('sent');
    await expect(approveOrder(order._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('will not submit an order with an unpriced line', async () => {
    const vendor = await newVendor('Unpriced Co');
    const order = await createOrder(
      { vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 1, unitPrice: 0 }] },
      user
    );
    await expect(submitOrder(order._id, user)).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('remembers the catalog price and vendor when an order is approved', async () => {
    const item = await createCatalogItem({ name: 'Cat Stapler', unit: 'pc' }, user);
    const vendor = await newVendor('Price Memory Co');
    const order = await createOrder(
      { vendorId: vendor._id, orderDate: today, lines: [{ catalogItemId: item._id, quantity: 2, unitPrice: 75 }] },
      user
    );
    await submitOrder(order._id, user);
    await approveOrder(order._id, user);
    const updated = await PurchasingCatalogItems.findOneAsync(item._id);
    expect(updated).toMatchObject({ lastUnitPrice: 75, lastVendorId: vendor._id });
  });

  it('refuses an inactive vendor for a new order', async () => {
    const vendor = await newVendor('Inactive Order Co');
    const { setVendorActive } = await import('./index');
    await setVendorActive(vendor._id, false, user);
    await expect(
      createOrder({ vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 1, unitPrice: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });
});

describe('receipts', () => {
  it('receives in parts, moves the order status, and refuses over-receipt', async () => {
    const { order } = await approvedOrder('Receipt Co');
    const [paper, pens] = order.lines;

    const first = await postReceipt(
      { orderId: order._id, receivedDate: today, deliveryNoteNo: 'DN-1', lines: [{ orderLineId: paper._id, receivedQuantity: 4 }] },
      user
    );
    expect(first.number).toMatch(/^GRN-/);
    expect((await getOrder(order._id)).status).toBe('partially-received');

    await expect(
      postReceipt({ orderId: order._id, receivedDate: today, lines: [{ orderLineId: paper._id, receivedQuantity: 7 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });

    await postReceipt(
      {
        orderId: order._id,
        receivedDate: today,
        lines: [
          { orderLineId: paper._id, receivedQuantity: 6 },
          { orderLineId: pens._id, receivedQuantity: 5, rejectedQuantity: 1 },
        ],
      },
      user
    );
    const done = await getOrder(order._id);
    expect(done.status).toBe('received');
    expect(done.lines.map((l) => l.receivedQuantity)).toEqual([10, 5]);

    // Fully received: nothing more can be received.
    await expect(
      postReceipt({ orderId: order._id, receivedDate: today, lines: [{ orderLineId: pens._id, receivedQuantity: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('refuses a receipt with no quantities, and one against a draft order', async () => {
    const { order } = await approvedOrder('Empty Receipt Co');
    await expect(
      postReceipt({ orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 0 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });

    const vendor = await newVendor('Draft Receipt Co');
    const draft = await createOrder(
      { vendorId: vendor._id, orderDate: today, lines: [{ description: 'A', unit: 'pc', quantity: 1, unitPrice: 1 }] },
      user
    );
    await expect(
      postReceipt({ orderId: draft._id, receivedDate: today, lines: [{ orderLineId: draft.lines[0]._id, receivedQuantity: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('voiding a receipt puts the quantities back, and is blocked by invoices', async () => {
    const { vendor, order } = await approvedOrder('Void Receipt Co');
    const paper = order.lines[0];
    const receipt = await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: paper._id, receivedQuantity: 10 }] },
      user
    );
    await createInvoice(
      {
        vendorId: vendor._id,
        orderId: order._id,
        vendorInvoiceNo: 'V-1',
        invoiceDate: today,
        lines: [{ orderLineId: paper._id, description: 'Paper', unit: 'ream', quantity: 10, unitPrice: 100, taxRate: 10 }],
      },
      user
    );
    await expect(voidReceipt(receipt._id, 'Mistake', user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });

    const { order: o2 } = await approvedOrder('Void Receipt Co 2');
    const r2 = await postReceipt(
      { orderId: o2._id, receivedDate: today, lines: [{ orderLineId: o2.lines[0]._id, receivedQuantity: 3 }] },
      user
    );
    const voided = await voidReceipt(r2._id, 'Wrong delivery', user);
    expect(voided.status).toBe('voided');
    const after = await getOrder(o2._id);
    expect(after.lines[0].receivedQuantity).toBe(0);
    expect(after.status).toBe('approved');
    await expect(voidReceipt(r2._id, 'again', user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('keeps the order and no receipt when the receipt cannot be saved', async () => {
    const { order } = await approvedOrder('Rollback Receipt Co');
    vi.spyOn(PurchasingReceipts, 'insertAsync').mockRejectedValueOnce(new Error('insert failed'));
    await expect(
      postReceipt({ orderId: order._id, receivedDate: today, lines: [{ orderLineId: order.lines[0]._id, receivedQuantity: 2 }] }, user)
    ).rejects.toThrow('insert failed');
    const after = await getOrder(order._id);
    expect(after.lines[0].receivedQuantity).toBe(0);
    expect(after.status).toBe('approved');
  });
});

describe('invoices and payments', () => {
  const receivedOrder = async (name: string) => {
    const { vendor, order } = await approvedOrder(name);
    await postReceipt(
      {
        orderId: order._id,
        receivedDate: today,
        lines: order.lines.map((l) => ({ orderLineId: l._id, receivedQuantity: l.quantity })),
      },
      user
    );
    return { vendor, order: await getOrder(order._id) };
  };

  const fullInvoiceLines = (order: Awaited<ReturnType<typeof getOrder>>) =>
    order.lines.map((l) => ({
      orderLineId: l._id,
      description: l.description,
      unit: l.unit,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
    }));

  it('invoices received goods, derives the due date from the terms and totals', async () => {
    const { vendor, order } = await receivedOrder('Invoice Co');
    const invoice = await createInvoice(
      { vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'INV-77', invoiceDate: today, lines: fullInvoiceLines(order) },
      user
    );
    expect(invoice).toMatchObject({ subtotal: 1250, taxTotal: 100, total: 1350, status: 'unpaid', isDisputed: false });
    expect(invoice.dueDate).toEqual(new Date(2030, 0, 40));
    expect((await getOrder(order._id)).lines.map((l) => l.invoicedQuantity)).toEqual([10, 5]);
  });

  it('refuses billing for more than was received unless accepted as disputed', async () => {
    const { vendor, order } = await approvedOrder('Overbill Co');
    const paper = order.lines[0];
    await postReceipt(
      { orderId: order._id, receivedDate: today, lines: [{ orderLineId: paper._id, receivedQuantity: 4 }] },
      user
    );
    const values = {
      vendorId: vendor._id,
      orderId: order._id,
      vendorInvoiceNo: 'OB-1',
      invoiceDate: today,
      lines: [{ orderLineId: paper._id, description: 'Paper', unit: 'ream', quantity: 6, unitPrice: 100, taxRate: 10 }],
    };
    await expect(createInvoice(values, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    expect((await getOrder(order._id)).lines[0].invoicedQuantity).toBe(0);

    const disputed = await createInvoice({ ...values, allowOverBilling: true }, user);
    expect(disputed.isDisputed).toBe(true);
    expect((await setInvoiceDisputed(disputed._id, false, user)).isDisputed).toBe(false);
  });

  it('refuses a duplicate vendor invoice number but allows it after a void', async () => {
    const { vendor, order } = await receivedOrder('Dup Invoice Co');
    const lines = fullInvoiceLines(order).slice(0, 1).map((l) => ({ ...l, quantity: 1 }));
    const values = { vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'D-1', invoiceDate: today, lines };
    const first = await createInvoice(values, user);
    await expect(createInvoice({ ...values, vendorInvoiceNo: 'd-1' }, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    await voidInvoice(first._id, user);
    await expect(createInvoice(values, user)).resolves.toBeTruthy();
  });

  it('pays in parts, then fully, and refuses overpaying', async () => {
    const { vendor, order } = await receivedOrder('Pay Co');
    const invoice = await createInvoice(
      { vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'P-1', invoiceDate: today, lines: fullInvoiceLines(order) },
      user
    );
    const part = await postPayment(
      { vendorId: vendor._id, paymentDate: today, method: 'cash', allocations: [{ invoiceId: invoice._id, amount: 350 }] },
      user
    );
    expect(part.number).toMatch(/^PAY-/);
    expect(await getInvoice(invoice._id)).toMatchObject({ paidAmount: 350, status: 'partially-paid' });

    await expect(
      postPayment({ vendorId: vendor._id, paymentDate: today, method: 'cash', allocations: [{ invoiceId: invoice._id, amount: 1001 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });

    await postPayment(
      { vendorId: vendor._id, paymentDate: today, method: 'bank-transfer', reference: 'TX1', allocations: [{ invoiceId: invoice._id, amount: 1000 }] },
      user
    );
    expect(await getInvoice(invoice._id)).toMatchObject({ paidAmount: 1350, status: 'paid' });
    await expect(
      postPayment({ vendorId: vendor._id, paymentDate: today, method: 'cash', allocations: [{ invoiceId: invoice._id, amount: 1 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });

  it('pays several invoices at once, only of the named vendor', async () => {
    const { vendor, order } = await receivedOrder('Multi Pay Co');
    const [l1, l2] = fullInvoiceLines(order);
    const i1 = await createInvoice({ vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'M-1', invoiceDate: today, lines: [l1] }, user);
    const i2 = await createInvoice({ vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'M-2', invoiceDate: today, lines: [l2] }, user);
    const other = await newVendor('Other Pay Co');
    await expect(
      postPayment({ vendorId: other._id, paymentDate: today, method: 'cash', allocations: [{ invoiceId: i1._id, amount: 10 }] }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });

    const payment = await postPayment(
      {
        vendorId: vendor._id,
        paymentDate: today,
        method: 'cheque',
        allocations: [
          { invoiceId: i1._id, amount: i1.total },
          { invoiceId: i2._id, amount: i2.total },
        ],
      },
      user
    );
    expect(payment.amount).toBe(i1.total + i2.total);
    expect((await getInvoice(i1._id)).status).toBe('paid');
    expect((await getInvoice(i2._id)).status).toBe('paid');
  });

  it('voiding a payment owes it again; an invoice with payments cannot be voided', async () => {
    const { vendor, order } = await receivedOrder('Void Pay Co');
    const invoice = await createInvoice(
      { vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'VP-1', invoiceDate: today, lines: fullInvoiceLines(order) },
      user
    );
    const payment = await postPayment(
      { vendorId: vendor._id, paymentDate: today, method: 'cash', allocations: [{ invoiceId: invoice._id, amount: 500 }] },
      user
    );
    await expect(voidInvoice(invoice._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    await voidPayment(payment._id, 'Bounced', user);
    expect(await getInvoice(invoice._id)).toMatchObject({ paidAmount: 0, status: 'unpaid' });
    await expect(voidPayment(payment._id, 'again', user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });

    await voidInvoice(invoice._id, user);
    expect((await getOrder(order._id)).lines.map((l) => l.invoicedQuantity)).toEqual([0, 0]);
  });

  it('leaves every invoice unchanged when one allocation in a payment fails', async () => {
    const { vendor, order } = await receivedOrder('Atomic Pay Co');
    const [l1, l2] = fullInvoiceLines(order);
    const i1 = await createInvoice({ vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'A-1', invoiceDate: today, lines: [l1] }, user);
    const i2 = await createInvoice({ vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'A-2', invoiceDate: today, lines: [l2] }, user);
    await expect(
      postPayment(
        {
          vendorId: vendor._id,
          paymentDate: today,
          method: 'cash',
          allocations: [
            { invoiceId: i1._id, amount: 100 },
            { invoiceId: i2._id, amount: i2.total + 1 },
          ],
        },
        user
      )
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
    expect((await getInvoice(i1._id)).paidAmount).toBe(0);
  });

  it('filters invoices as overdue', async () => {
    const { vendor, order } = await receivedOrder('Overdue Co');
    const lines = fullInvoiceLines(order).slice(0, 1);
    const late = await createInvoice(
      { vendorId: vendor._id, orderId: order._id, vendorInvoiceNo: 'OD-1', invoiceDate: new Date(2000, 0, 1), dueDate: new Date(2000, 1, 1), lines },
      user
    );
    const overdue = await listInvoices({ overdue: true, vendorId: vendor._id });
    expect(overdue.data.map((i) => i._id)).toContain(late._id);
    expect((await listInvoices({ search: 'od-1' })).totalResults).toBe(1);
  });
});

describe('closing and cancelling orders', () => {
  it('closes a received order, and refuses to cancel one with receipts', async () => {
    const { order } = await approvedOrder('Close Co');
    await postReceipt(
      { orderId: order._id, receivedDate: today, lines: order.lines.map((l) => ({ orderLineId: l._id, receivedQuantity: l.quantity })) },
      user
    );
    await expect(cancelOrder(order._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    expect((await getOrder(order._id)).status).toBe('received');
    expect((await closeOrder(order._id, user)).status).toBe('closed');
    expect((await listOrders({ status: 'closed' })).data.map((o) => o._id)).toContain(order._id);
  });
});

describe('deleting records that are in use', () => {
  it('blocks deleting a vendor and a catalog item that documents refer to', async () => {
    const item = await createCatalogItem({ name: 'Cat In Use', unit: 'pc' }, user);
    const vendor = await newVendor('In Use Co');
    await createOrder(
      { vendorId: vendor._id, orderDate: today, lines: [{ catalogItemId: item._id, quantity: 1, unitPrice: 5 }] },
      user
    );
    await expect(deleteVendor(vendor._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
    await expect(deleteCatalogItem(item._id, user)).rejects.toMatchObject({ extensions: { code: 'CONFLICT' } });
  });
});
