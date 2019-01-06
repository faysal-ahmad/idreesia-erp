import { ItemTypes, ItemCategories } from "/imports/lib/collections/inventory";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "/imports/lib/constants";

import getItemTypes from "./queries";
import { getItemTypeFormattedName } from "./helpers";

export default {
  ItemType: {
    itemCategoryName: itemType => {
      const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
      return itemCategory.name;
    },
    formattedName: itemType => getItemTypeFormattedName(itemType),
    formattedUOM: itemType => {
      let uom = null;
      switch (itemType.unitOfMeasurement) {
        case "quantity":
          uom = "Quantity";
          break;
        case "ft":
          uom = "Length (ft)";
          break;
        case "m":
          uom = "Length (m)";
          break;
        case "kg":
          uom = "Weight (kg)";
          break;
        case "lbs":
          uom = "Weight (lbs)";
          break;
        case "l":
          uom = "Volume (liters)";
          break;
        default:
          break;
      }
      return uom;
    },
  },

  Query: {
    allItemTypes() {
      return ItemTypes.find({}).fetch();
    },

    pagedItemTypes(obj, { queryString }) {
      return getItemTypes(queryString);
    },

    itemTypeById(obj, { _id }) {
      return ItemTypes.findOne(_id);
    },
  },

  Mutation: {
    createItemType(
      obj,
      { name, urduName, company, details, unitOfMeasurement, itemCategoryId },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      const itemTypeId = ItemTypes.insert({
        name,
        urduName,
        company,
        details,
        unitOfMeasurement,
        itemCategoryId,
        createdAt: date,
        createdBy: userId,
        updatedAt: date,
        updatedBy: userId,
      });

      return ItemTypes.findOne(itemTypeId);
    },

    updateItemType(
      obj,
      {
        _id,
        name,
        urduName,
        company,
        details,
        unitOfMeasurement,
        itemCategoryId,
      },
      { userId }
    ) {
      if (
        !hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      ItemTypes.update(_id, {
        $set: {
          name,
          urduName,
          company,
          details,
          unitOfMeasurement,
          itemCategoryId,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return ItemTypes.findOne(_id);
    },

    setItemTypeImage(obj, { _id, imageId }, { userId }) {
      if (
        !hasOnePermission(userId, [PermissionConstants.IN_MANAGE_SETUP_DATA])
      ) {
        throw new Error(
          "You do not have permission to manage Inventory Setup Data in the System."
        );
      }

      const date = new Date();
      ItemTypes.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: userId,
        },
      });

      return ItemTypes.findOne(_id);
    },
  },
};
