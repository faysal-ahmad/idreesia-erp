import { PurchasingReceipts } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  listReceipts,
  postReceipt,
  requireDateInput,
  voidReceipt,
  type ReceiptLineInput,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { ReceiptStatusValue } from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  user: { _id: string };
  loaders: {
    common: { people: Loader };
    purchasing: { vendors: Loader; orders: Loader };
  };
}

export default {
  PurchasingReceipt: {
    source: (receipt: { source?: string }) => receipt.source ?? 'purchasing',
    order: async (receipt: { orderId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.orders.load(receipt.orderId),
    vendor: async (receipt: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) =>
      loaders.purchasing.vendors.load(receipt.vendorId),
    receivedByPerson: async (receipt: { receivedBy?: string }, _args: unknown, { loaders }: ResolverContext) =>
      receipt.receivedBy ? loaders.common.people.load(receipt.receivedBy) : null,
  },

  Query: {
    purchasingReceiptById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingReceipts.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingReceipts: async (
      _obj: unknown,
      args: {
        search?: string;
        status?: ReceiptStatusValue;
        vendorId?: string;
        orderId?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listReceipts(args),
  },

  Mutation: {
    postPurchasingReceipt: async (
      _obj: unknown,
      {
        receivedDate,
        ...rest
      }: {
        orderId: string;
        receivedDate: string;
        receivedBy?: string;
        deliveryNoteNo?: string;
        notes?: string;
        lines: ReceiptLineInput[];
      },
      { user }: ResolverContext
    ) =>
      postReceipt(
        { ...rest, receivedDate: requireDateInput(receivedDate, 'The received date') },
        user
      ),

    voidPurchasingReceipt: async (
      _obj: unknown,
      { _id, reason }: { _id: string; reason: string },
      { user }: ResolverContext
    ) => voidReceipt(_id, reason, user),
  },
};
