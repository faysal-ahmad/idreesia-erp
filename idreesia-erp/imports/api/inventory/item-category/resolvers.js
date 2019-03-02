import {
  ItemCategories,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

export default {
  ItemCategory: {
    stockItemCount: itemCategory =>
      StockItems.find({
        categoryId: { $eq: itemCategory._id },
      }).count(),
  },

  Query: {
    allItemCategories() {
      return ItemCategories.find({}).fetch();
    },
    itemCategoryById(obj, { id }) {
      return ItemCategories.findOne(id);
    },
  },

  Mutation: {
    createItemCategory(obj, { name }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      const itemCategoryId = ItemCategories.insert({
        name,
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
