import { PurchasingOrders } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  approveOrder,
  cancelOrder,
  closeOrder,
  createOrder,
  createOrderFromQuote,
  createOrderFromRequisition,
  deleteOrder,
  listOrders,
  markOrderSent,
  parseDateInput,
  rejectOrder,
  requireDateInput,
  submitOrder,
  updateOrder,
  type OrderLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { OrderStatusValue } from 'meteor/idreesia-common/constants/purchasing';

interface ResolverContext {
  user: { _id: string };
  loaders: { purchasing: { vendors: { load(id: string): Promise<unknown> } } };
}

interface OrderArgs {
  vendorId: string;
  orderDate: string;
  expectedDeliveryDate?: string;
  deliveryAddress?: string;
  paymentTermsDays?: number;
  notes?: string;
  discount?: number;
  shipping?: number;
  lines: OrderLineInput[];
}

const toValues = ({ orderDate, expectedDeliveryDate, ...rest }: OrderArgs) => ({
  ...rest,
  orderDate: requireDateInput(orderDate, 'The order date'),
  expectedDeliveryDate: parseDateInput(expectedDeliveryDate) ?? null,
});

type IdArgs = { _id: string };

export default {
  PurchasingOrder: {
    vendor: async (order: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.vendors.load(order.vendorId),
  },

  Query: {
    purchasingOrderById: async (_obj: unknown, { _id }: IdArgs) =>
      PurchasingOrders.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingOrders: async (
      _obj: unknown,
      {
        fromDate,
        toDate,
        ...args
      }: {
        search?: string;
        status?: OrderStatusValue;
        vendorId?: string;
        requisitionId?: string;
        fromDate?: string;
        toDate?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) =>
      listOrders({
        ...args,
        fromDate: parseDateInput(fromDate),
        toDate: parseDateInput(toDate),
      }),
  },

  Mutation: {
    createPurchasingOrder: async (_obj: unknown, args: OrderArgs, { user }: ResolverContext) =>
      createOrder(toValues(args), user),

    updatePurchasingOrder: async (
      _obj: unknown,
      { _id, version, ...rest }: OrderArgs & IdArgs & { version: number },
      { user }: ResolverContext
    ) => updateOrder(_id, version, toValues(rest), user),

    createPurchasingOrderFromRequisition: async (
      _obj: unknown,
      { requisitionId, vendorId }: { requisitionId: string; vendorId: string },
      { user }: ResolverContext
    ) => createOrderFromRequisition(requisitionId, vendorId, user),

    createPurchasingOrderFromQuote: async (
      _obj: unknown,
      { quoteId }: { quoteId: string },
      { user }: ResolverContext
    ) => createOrderFromQuote(quoteId, user),

    submitPurchasingOrder: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) =>
      submitOrder(_id, user),

    markPurchasingOrderSent: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) =>
      markOrderSent(_id, user),

    closePurchasingOrder: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) =>
      closeOrder(_id, user),

    cancelPurchasingOrder: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) =>
      cancelOrder(_id, user),

    deletePurchasingOrder: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) => {
      await deleteOrder(_id, user);
      return true;
    },

    approvePurchasingOrder: async (_obj: unknown, { _id }: IdArgs, { user }: ResolverContext) =>
      approveOrder(_id, user),

    rejectPurchasingOrder: async (
      _obj: unknown,
      { _id, reason }: IdArgs & { reason: string },
      { user }: ResolverContext
    ) => rejectOrder(_id, reason, user),
  },
};
