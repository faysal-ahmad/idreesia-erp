import { ItemTypes, ItemCategories } from '/imports/lib/collections/inventory';

export default {
  ItemType: {
    itemCategoryName: itemType => {
      const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
      return itemCategory.name;
    },
    formattedUOM: itemType => {
      let uom = null;
      switch (itemType.unitOfMeasurement) {
        case 'quantity':
          uom = 'Quantity';
          break;
        case 'ft':
          uom = 'Length (ft)';
          break;
        case 'm':
          uom = 'Length (m)';
          break;
        case 'kg':
          uom = 'Weight (kg)';
          break;
        case 'lbs':
          uom = 'Weight (lbs)';
          break;
        default:
          break;
      }
      return uom;
    }
  },

  Query: {
    allItemTypes(obj, { itemCategoryId }, context) {
      if (!itemCategoryId) return ItemTypes.find({}).fetch();
      else return ItemTypes.find({ itemCategoryId: { $eq: itemCategoryId } }).fetch();
    },
    itemTypeById(obj, { id }, context) {
      return ItemTypes.findOne(id);
    }
  },

  Mutation: {
    createItemType(
      obj,
      { name, description, unitOfMeasurement, singleUse, itemCategoryId },
      { userId }
    ) {
      const date = new Date();
      const itemTypeId = ItemTypes.insert({
        name,
        description,
        unitOfMeasurement,
        singleUse,
        itemCategoryId,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId
      });

      return ItemCategories.findOne(itemCategoryId);
    },

    updateItemType(obj, { id, name, description, unitOfMeasurement, singleUse }, { userId }) {
      const date = new Date();
      ItemTypes.update(id, {
        $set: {
          name,
          description,
          unitOfMeasurement,
          singleUse,
          updatedAt: date,
          updatedBy: userId
        }
      });

      return ItemTypes.findOne(id);
    }
  }
};
