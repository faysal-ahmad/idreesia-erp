import { PurchasingCatalogItems } from 'meteor/idreesia-common/server/collections/purchasing';
import {
  createCatalogItem,
  deleteCatalogItem,
  getCatalogItemImageUrl,
  removeCatalogItemImage,
  setCatalogItemImage,
  listCatalogItems,
  setCatalogItemActive,
  updateCatalogItem,
  type CatalogItemValues,
} from 'meteor/idreesia-common/server/business-logic/purchasing';

interface ResolverContext {
  user: { _id: string };
}

export default {
  PurchasingCatalogItem: {
    imageUrl: (item: { imageKey?: string | null }) => getCatalogItemImageUrl(item),
  },

  Query: {
    purchasingCatalogItemById: async (
      _obj: unknown,
      { _id }: { _id: string }
    ) => PurchasingCatalogItems.findOneAsync({ _id: { $eq: _id } }),

    pagedPurchasingCatalogItems: async (
      _obj: unknown,
      args: {
        search?: string;
        isActive?: boolean;
        pageIndex?: number;
        pageSize?: number;
      }
    ) => listCatalogItems(args),
  },

  Mutation: {
    createPurchasingCatalogItem: async (
      _obj: unknown,
      values: CatalogItemValues,
      { user }: ResolverContext
    ) => createCatalogItem(values, user),

    updatePurchasingCatalogItem: async (
      _obj: unknown,
      { _id, ...values }: CatalogItemValues & { _id: string },
      { user }: ResolverContext
    ) => updateCatalogItem(_id, values, user),

    setPurchasingCatalogItemImage: async (
      _obj: unknown,
      { _id, imageData }: { _id: string; imageData: string },
      { user }: ResolverContext
    ) => setCatalogItemImage(_id, imageData, user),

    removePurchasingCatalogItemImage: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => removeCatalogItemImage(_id, user),

    setPurchasingCatalogItemActive: async (
      _obj: unknown,
      { _id, isActive }: { _id: string; isActive: boolean },
      { user }: ResolverContext
    ) => setCatalogItemActive(_id, isActive, user),

    removePurchasingCatalogItem: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      await deleteCatalogItem(_id, user);
      return true;
    },
  },
};
