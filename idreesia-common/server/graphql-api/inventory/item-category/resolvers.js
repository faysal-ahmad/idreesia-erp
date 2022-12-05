import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import {
  hasOnePermission,
  hasInstanceAccess,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  ItemCategory: {
    stockItemCount: async itemCategory =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).count(),
  },

  Query: {
    itemCategoryById: async (obj, { id }, { user }) => {
      const itemCategory = ItemCategories.findOne(id);
      if (hasInstanceAccess(user, itemCategory.physicalStoreId) === false) {
        return null;
      }
      return itemCategory;
    },

    itemCategoriesByPhysicalStoreId: async (
      obj,
      { physicalStoreId },
      { user }
    ) => {
      if (hasInstanceAccess(user, physicalStoreId) === false) return [];
      return ItemCategories.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetch();
    },
  },

  Mutation: {
    createItemCategory: async (obj, { name, physicalStoreId }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      const itemCategoryId = ItemCategories.insert({
        name,
        physicalStoreId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return ItemCategories.findOne(itemCategoryId);
    },

    updateItemCategory: async (obj, { id, name }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingItemCategory = ItemCategories.findOne(id);
      if (
        !existingItemCategory ||
        hasInstanceAccess(user, existingItemCategory.physicalStoreId) === false
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      const date = new Date();
      ItemCategories.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return ItemCategories.findOne(id);
    },

    removeItemCategory: async (obj, { _id, physicalStoreId }, { user }) => {
      if (!hasOnePermission(user, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      if (hasInstanceAccess(user, physicalStoreId) === false) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in this Physical Store.'
        );
      }

      // Check that there are no stock items against this item category.
      const stockItemCount = StockItems.find({
        categoryId: { $eq: _id },
      }).count();

      if (stockItemCount === 0) {
        return ItemCategories.remove(_id);
      }

      return 0;
    },
  },
};
