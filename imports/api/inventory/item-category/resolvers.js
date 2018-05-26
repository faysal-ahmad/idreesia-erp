import { ItemCategories, ItemTypes } from '/imports/lib/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from '/imports/lib/constants';

export default {
  ItemCategory: {
    itemTypeCount: itemCategory => {
      return ItemTypes.find({
        itemCategoryId: { $eq: itemCategory._id }
      }).count();
    }
  },

  Query: {
    allItemCategories() {
      return ItemCategories.find({}).fetch();
    },
    itemCategoryById(obj, { id }, context) {
      return ItemCategories.findOne(id);
    }
  },

  Mutation: {
    createItemCategory(obj, { name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
      }

      const date = new Date();
      const itemCategoryId = ItemCategories.insert({
        name,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return ItemCategories.findOne(itemCategoryId);
    },

    updateItemCategory(obj, { id, name }, { userId }) {
      if (!hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])) {
        throw new Error('You do not have permission to manage Inventory Setup Data in the System.');
      }

      const date = new Date();
      ItemCategories.update(id, {
        $set: {
          name,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return ItemCategories.findOne(id);
    }
  }
};
