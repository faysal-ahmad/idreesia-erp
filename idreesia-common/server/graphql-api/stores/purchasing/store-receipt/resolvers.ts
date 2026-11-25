import {
  getReceipt,
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
    purchasing: { orders: Loader };
    common: { people: Loader };
  };
}

interface StoreArgs {
  physicalStoreId: string;
}

export default {
  StoreReceipt: {
    orderNumber: async (receipt: { orderId: string }, _args: unknown, { loaders }: ResolverContext) => {
      const order = (await loaders.purchasing.orders.load(receipt.orderId)) as { number?: string } | null;
      return order?.number ?? null;
    },
    receivedByPerson: async (receipt: { receivedBy?: string }, _args: unknown, { loaders }: ResolverContext) =>
      receipt.receivedBy ? loaders.common.people.load(receipt.receivedBy) : null,
  },

  Query: {
    storeReceiptById: async (_obj: unknown, { _id, physicalStoreId }: StoreArgs & { _id: string }) =>
      getReceipt(_id, { physicalStoreId }).catch(() => null),

    pagedStoreReceipts: async (
      _obj: unknown,
      args: StoreArgs & {
        search?: string;
        status?: ReceiptStatusValue;
        orderId?: string;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listReceipts(args),
  },

  Mutation: {
    postStoreReceipt: async (
      _obj: unknown,
      {
        physicalStoreId,
        receivedDate,
        ...rest
      }: StoreArgs & {
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
        user,
        { physicalStoreId }
      ),

    voidStoreReceipt: async (
      _obj: unknown,
      { _id, reason, physicalStoreId }: StoreArgs & { _id: string; reason: string },
      { user }: ResolverContext
    ) => voidReceipt(_id, reason, user, { physicalStoreId }),
  },
};
