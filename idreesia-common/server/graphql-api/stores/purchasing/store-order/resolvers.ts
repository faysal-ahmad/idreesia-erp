import { PurchasingRequisitions } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  getStoreOrder,
  listStoreOrders,
} from 'meteor/idreesia-common/server/business-logic/purchasing';
import type { OrderStatusValue } from 'meteor/idreesia-common/constants/purchasing';

type Loader = { load(id: string): Promise<unknown> };
interface ResolverContext {
  loaders: { purchasing: { vendors: Loader } };
}

export default {
  StoreOrder: {
    vendorName: async (order: { vendorId: string }, _args: unknown, { loaders }: ResolverContext) => {
      const vendor = (await loaders.purchasing.vendors.load(order.vendorId)) as { name?: string } | null;
      return vendor?.name ?? null;
    },
    requisitionNumber: async (order: { requisitionId?: string }) => {
      if (!order.requisitionId) return null;
      const requisition = await PurchasingRequisitions.findOneAsync(
        { _id: { $eq: order.requisitionId } },
        { fields: { number: 1 } }
      );
      return requisition?.number ?? null;
    },
  },

  Query: {
    storeOrderById: async (
      _obj: unknown,
      { _id, physicalStoreId }: { _id: string; physicalStoreId: string }
    ) => getStoreOrder(_id, physicalStoreId),

    pagedStoreOrders: async (
      _obj: unknown,
      args: {
        physicalStoreId: string;
        search?: string;
        requisitionId?: string;
        statuses?: OrderStatusValue[];
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listStoreOrders(args),
  },
};
