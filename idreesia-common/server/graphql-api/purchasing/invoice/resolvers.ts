import { PurchasingInvoices } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createInvoice,
  listInvoices,
  parseDateInput,
  requireDateInput,
  setInvoiceDisputed,
  updateInvoice,
  voidInvoice,
  type InvoiceLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { InvoiceStatusValue } from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: { purchasing: { vendors: Loader; orders: Loader } };
}

export default {
  PurchasingInvoice: {
    vendor: async (invoice: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.vendors.load(invoice.vendorId),
    orders: async (invoice: { orderId?: string; orderIds?: string[] }, _args: unknown, { loaders }: ResolverContext) => {
      const ids = invoice.orderIds ?? (invoice.orderId ? [invoice.orderId] : []);
      return Promise.all(ids.map((id) => loaders.purchasing.orders.load(id)));
    },
    balance: (invoice: { total: number; paidAmount: number }) =>
      Math.round((invoice.total - invoice.paidAmount) * 100) / 100,
  },

  Query: {
    purchasingInvoiceById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingInvoices.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingInvoices: async (
      _obj: unknown,
      {
        fromDate,
        toDate,
        ...args
      }: {
        search?: string;
        status?: InvoiceStatusValue;
        vendorId?: string;
        orderId?: string;
        isDisputed?: boolean;
        overdue?: boolean;
        fromDate?: string;
        toDate?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) =>
      listInvoices({
        ...args,
        fromDate: parseDateInput(fromDate),
        toDate: parseDateInput(toDate),
      }),
  },

  Mutation: {
    createPurchasingInvoice: async (
      _obj: unknown,
      {
        invoiceDate,
        dueDate,
        ...rest
      }: {
        vendorId: string;
        vendorInvoiceNo: string;
        invoiceDate: string;
        dueDate?: string;
        notes?: string;
        allowOverBilling?: boolean;
        lines: InvoiceLineInput[];
      },
      { user }: ResolverContext
    ) =>
      createInvoice(
        {
          ...rest,
          invoiceDate: requireDateInput(invoiceDate, 'The invoice date'),
          dueDate: parseDateInput(dueDate) ?? null,
        },
        user
      ),

    updatePurchasingInvoice: async (
      _obj: unknown,
      {
        _id,
        dueDate,
        ...rest
      }: { _id: string; vendorInvoiceNo: string; dueDate: string; notes?: string },
      { user }: ResolverContext
    ) => updateInvoice(_id, { ...rest, dueDate: requireDateInput(dueDate, 'The due date') }, user),

    setPurchasingInvoiceDisputed: async (
      _obj: unknown,
      { _id, isDisputed }: { _id: string; isDisputed: boolean },
      { user }: ResolverContext
    ) => setInvoiceDisputed(_id, isDisputed, user),

    voidPurchasingInvoice: async (_obj: unknown, { _id }: { _id: string }, { user }: ResolverContext) =>
      voidInvoice(_id, user),
  },
};
