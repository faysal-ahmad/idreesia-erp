import {
  PhysicalStores,
  ItemCategories,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import { hasInstanceAccess, hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getPagedStockItems from "./queries";

export default {
  StockItem: {
    formattedName: stockItem => {
      const { name, company, details } = stockItem;
      let formattedName = name;
      if (company) {
        formattedName = `${formattedName} - ${company}`;
      }
      if (details) {
        formattedName = `${formattedName} - ${details}`;
      }
      return formattedName;
    },
    categoryName: stockItem => {
      const itemCategory = ItemCategories.findOne(stockItem.categoryId);
      return itemCategory.name;
    },
    physicalStoreName: stockItem => {
      const physicalStore = PhysicalStores.findOne(stockItem.physicalStoreId);
      return physicalStore.name;
    },
    formattedUOM: stockItem => {
      let uom = null;
      switch (stockItem.unitOfMeasurement) {
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
    pagedStockItems(obj, { physicalStoreId, queryString }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getPagedStockItems(queryString, physicalStoreId);
    },

    stockItemById(obj, { _id }, { user }) {
      const stockItem = StockItems.findOne(_id);
      if (hasInstanceAccess(user._id, stockItem.physicalStoreId) === false) {
        return null;
      }
      return stockItem;
    },

    stockItemsById(obj, { physicalStoreId, _ids }, { user }) {
      if (!_ids || _ids.length === 0) return [];
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];

      return StockItems.find({
        _id: { $in: _ids },
        physicalStoreId: { $eq: physicalStoreId },
      }).fetch();
    },
  },

  Mutation: {
    createStockItem(
      obj,
      {
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        physicalStoreId,
        minStockLevel,
        currentStockLevel,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Items in the System."
        );
      }

      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        throw new Error(
          "You do not have permission to manage Stock Items in this Physical Store."
        );
      }

      const date = new Date();
      const stockItemId = StockItems.insert({
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        physicalStoreId,
        minStockLevel,
        startingStockLevel: currentStockLevel,
        currentStockLevel,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return StockItems.findOne(stockItemId);
    },

    updateStockItem(
      obj,
      {
        _id,
        name,
        company,
        details,
        unitOfMeasurement,
        categoryId,
        minStockLevel,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Items in the System."
        );
      }

      const existingStockItem = StockItems.findOne(_id);
      if (
        !existingStockItem ||
        hasInstanceAccess(user._id, existingStockItem.physicalStoreId) === false
      ) {
        throw new Error(
          "You do not have permission to manage Stock Items in the System."
        );
      }

      const date = new Date();
      StockItems.update(_id, {
        $set: {
          name,
          company,
          details,
          unitOfMeasurement,
          categoryId,
          minStockLevel,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOne(_id);
    },

    setStockItemImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.IN_MANAGE_STOCK_ITEMS])
      ) {
        throw new Error(
          "You do not have permission to manage Stock Items in the System."
        );
      }

      const date = new Date();
      StockItems.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOne(_id);
    },
  },
};
