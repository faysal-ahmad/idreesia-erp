import { ItemCategories } from '/imports/lib/collections/inventory';

export default {
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
