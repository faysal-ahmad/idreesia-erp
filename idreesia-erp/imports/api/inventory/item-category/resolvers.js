import { ItemCategories, ItemTypes } from 'meteor/idreesia-common/collections/inventory';
import { hasOnePermission } from '/imports/api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export default {
  ItemCategory: {
    itemTypeCount: itemCategory =>
      ItemTypes.find({
        itemCategoryId: { $eq: itemCategory._id },
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
        updatedBy: userId,
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
          updatedBy: userId,
        },
      });

      return ItemCategories.findOne(id);
    },
  },
};
