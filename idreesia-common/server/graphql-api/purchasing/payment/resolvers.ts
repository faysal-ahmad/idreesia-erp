import {
  PurchasingInvoices,
  PurchasingPayments,
  type PaymentAllocation,
} from 'meteor/idreesia-common/server/collections/purchasing';
import {
  listPayments,
  parseDateInput,
  postPayment,
  requireDateInput,
  voidPayment,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type {
  PaymentMethodValue,
  PaymentStatusValue,
} from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: { purchasing: { vendors: Loader } };
}

export default {
  PurchasingPayment: {
    vendor: async (payment: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.vendors.load(payment.vendorId),
  },

  PurchasingPaymentAllocation: {
    invoice: async (allocation: PaymentAllocation) =>
      PurchasingInvoices.findOneAsync({ _id: { $eq: allocation.invoiceId } }),
  },

  Query: {
    purchasingPaymentById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingPayments.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingPayments: async (
      _obj: unknown,
      {
        fromDate,
        toDate,
        ...args
      }: {
        search?: string;
        status?: PaymentStatusValue;
        vendorId?: string;
        fromDate?: string;
        toDate?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) =>
      listPayments({
        ...args,
        fromDate: parseDateInput(fromDate),
        toDate: parseDateInput(toDate),
      }),
  },

  Mutation: {
    postPurchasingPayment: async (
      _obj: unknown,
      {
        paymentDate,
        method,
        ...rest
      }: {
        vendorId: string;
        paymentDate: string;
        method: string;
        reference?: string;
        notes?: string;
        allocations: PaymentAllocation[];
      },
      { user }: ResolverContext
    ) =>
      postPayment(
        {
          ...rest,
          method: method as PaymentMethodValue,
          paymentDate: requireDateInput(paymentDate, 'The payment date'),
        },
        user
      ),

    voidPurchasingPayment: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => voidPayment(_id, reason, user),
  },
};
