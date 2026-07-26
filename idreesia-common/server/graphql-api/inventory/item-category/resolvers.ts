import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

interface ItemCategory {
  _id: string;
}

interface ItemCategoryArgs extends ItemCategory {
  name?: string;
  physicalStoreId: string;
}

interface ResolverContext {
  user: {
    _id: string;
  };
}

export default {
  ItemCategory: {
    stockItemCount: async (itemCategory: ItemCategory) =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).countAsync(),
  },

  Query: {
    itemCategoryById: async (
      _obj: unknown,
      { _id }: Pick<ItemCategoryArgs, '_id'>
    ) => {
      return ItemCategories.findOneAsync(_id);
    },

    itemCategoriesByPhysicalStoreId: async (
      _obj: unknown,
      { physicalStoreId }: Pick<ItemCategoryArgs, 'physicalStoreId'>
    ) => {
      return ItemCategories.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetchAsync();
    },
  },

  Mutation: {
    createItemCategory: async (
      _obj: unknown,
      { name, physicalStoreId }: ItemCategoryArgs,
      { user }: ResolverContext
    ) => {
      const date = new Date();
      const itemCategoryId = await ItemCategories.insertAsync({
        name,
        physicalStoreId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return ItemCategories.findOneAsync(itemCategoryId);
    },

    updateItemCategory: async (
      _obj: unknown,
      { _id, name, physicalStoreId }: ItemCategoryArgs,
      { user }: ResolverContext
    ) => {
      const date = new Date();
      await ItemCategories.updateAsync(
        {
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        },
        {
          $set: {
            name,
            updatedAt: date,
            updatedBy: user._id,
          },
        }
      );

      return ItemCategories.findOneAsync(_id);
    },

    removeItemCategory: async (
      _obj: unknown,
      { _id, physicalStoreId }: ItemCategoryArgs
    ) => {
      // Check that there are no stock items against this item category.
      const stockItemCount = await StockItems.find({
        categoryId: { $eq: _id },
        physicalStoreId: { $eq: physicalStoreId },
      }).countAsync();

      if (stockItemCount === 0) {
        return ItemCategories.removeAsync({
          _id: { $eq: _id },
          physicalStoreId: { $eq: physicalStoreId },
        });
      }

      return 0;
    },
  },
};
