import {
  ItemCategories,
  PhysicalStores,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasOnePermission,
  hasInstanceAccess,
} from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  ItemCategory: {
    stockItemCount: itemCategory =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).count(),
  },

  Query: {
    itemCategoryById(obj, { id }, { user }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(
        physicalStore => physicalStore._id
      );

      return ItemCategories.findOne({
        _id: { $eq: id },
        physicalStoreId: { $in: physicalStoreIds },
      });
    },

    itemCategoriesByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      return ItemCategories.find({
        physicalStoreId: { $eq: physicalStoreId },
      }).fetch();
    },
  },

  Mutation: {
    createItemCategory(obj, { name, physicalStoreId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in this Physical Store."
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
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const existingItemCategory = ItemCategories.findOne(id);
      if (
        !existingItemCategory ||
        hasInstanceAccess(user._id, existingItemCategory.physicalStoreId) ===
          false
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in this Physical Store."
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
