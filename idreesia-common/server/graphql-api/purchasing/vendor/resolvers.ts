import { PurchasingVendors } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createVendor,
  deleteVendor,
  listVendors,
  setVendorActive,
  updateVendor,
  type VendorValues,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

interface ResolverContext {
  user: { _id: string };
}

type VendorArgs = VendorValues & { _id: string };

export default {
  Query: {
    purchasingVendorById: async (_obj: unknown, { _id }: { _id: string }) =>
      PurchasingVendors.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingVendors: async (
      _obj: unknown,
      args: {
        search?: string;
        isActive?: boolean;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listVendors(args),
  },

  Mutation: {
    createPurchasingVendor: async (
      _obj: unknown,
      values: VendorValues,
      { user }: ResolverContext
    ) => createVendor(values, user),

    updatePurchasingVendor: async (
      _obj: unknown,
      { _id, ...values }: VendorArgs,
      { user }: ResolverContext
    ) => updateVendor(_id, values, user),

    setPurchasingVendorActive: async (
      _obj: unknown,
      { _id, isActive }: { _id: string; isActive: boolean },
      { user }: ResolverContext
    ) => setVendorActive(_id, isActive, user),

    removePurchasingVendor: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      await deleteVendor(_id, user);
      return true;
    },
  },
};
