import {
  ItemCategories,
  StockItems,
} from 'meteor/idreesia-common/collections/inventory';
import {
  hasOnePermission,
  hasInstanceAccess,
} from 'meteor/idreesia-common/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  ItemCategory: {
    stockItemCount: itemCategory =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).count(),
  },

  Query: {
    itemCategoryById(obj, { id }, { user }) {
      const itemCategory = ItemCategories.findOne(id);
      if (hasInstanceAccess(user._id, itemCategory.physicalStoreId) === false) {
        return null;
      }
      return itemCategory;
    },

    itemCategoriesByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      return ItemCategories.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { sort: { name: 1 } }
      ).fetch();
    },
  },

  Mutation: {
    createItemCategory(obj, { name, physicalStoreId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
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

    updateItemCategory(obj, { id, name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          'You do not have permission to manage Inventory Setup Data in the System.'
        );
      }

      const existingItemCategory = ItemCategories.findOne(id);
      if (
        !existingItemCategory ||
        hasInstanceAccess(user._id, existingItemCategory.physicalStoreId) ===
          false
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
  },
};
