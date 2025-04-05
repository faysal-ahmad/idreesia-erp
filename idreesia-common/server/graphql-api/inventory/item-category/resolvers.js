import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

export default {
  ItemCategory: {
    stockItemCount: async itemCategory =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).count(),
  },

  Query: {
    itemCategoryById: async (obj, { _id }) => {
      return ItemCategories.findOneAsync(_id);
    },

    itemCategoriesByPhysicalStoreId: async (
      obj,
      { physicalStoreId },
      { user }
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
    createItemCategory: async (obj, { name, physicalStoreId }, { user }) => {
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
      obj,
      { _id, name, physicalStoreId },
      { user }
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

    removeItemCategory: async (obj, { _id, physicalStoreId }, { user }) => {
      // Check that there are no stock items against this item category.
      const stockItemCount = StockItems.find({
        categoryId: { $eq: _id },
        physicalStoreId: { $eq: physicalStoreId },
      }).count();

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
