import {
  PhysicalStores,
  ItemCategories,
  ItemTypes,
  StockItems,
} from "meteor/idreesia-common/collections/inventory";
import {
  filterByInstanceAccess,
  hasInstanceAccess,
  hasOnePermission,
} from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import getPagedStockItems, { getAllStockItems } from "./queries";

export default {
  StockItem: {
    itemTypeName: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.name;
    },
    itemTypeFormattedName: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      const { name, company, details } = itemType;
      let formattedName = name;
      if (company) {
        formattedName = `${formattedName} - ${company}`;
      }
      if (details) {
        formattedName = `${formattedName} - ${details}`;
      }
      return formattedName;
    },
    itemTypeCompany: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.company;
    },
    itemTypeDetails: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.details;
    },
    itemTypeImageId: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.imageId;
    },
    itemCategoryName: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      const itemCategory = ItemCategories.findOne(itemType.itemCategoryId);
      return itemCategory.name;
    },
    unitOfMeasurement: stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      return itemType.unitOfMeasurement;
    },
    physicalStoreName: stockItem => {
      const physicalStore = PhysicalStores.findOne(stockItem.physicalStoreId);
      return physicalStore.name;
    },
  },

  Query: {
    allStockItems(obj, params, { user }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];

      const physicalStoreIds = filteredPhysicalStores.map(
        physicalStore => physicalStore._id
      );
      return StockItems.find({
        physicalStoreId: { $in: physicalStoreIds },
      }).fetch();
    },

    pagedStockItems(obj, { physicalStoreId, queryString }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) {
        return {
          stockItems: [],
          totalResults: 0,
        };
      }

      return getPagedStockItems(queryString, physicalStoreId);
    },

    stockItemById(obj, { _id }, { user }) {
      const physicalStores = PhysicalStores.find({}).fetch();
      const filteredPhysicalStores = filterByInstanceAccess(
        user._id,
        physicalStores
      );
      if (filteredPhysicalStores.length === 0) return [];
      const physicalStoreIds = physicalStores.map(
        physicalStore => physicalStore._id
      );

      return StockItems.findOne({
        _id: { $eq: _id },
        physicalStoreId: { $in: physicalStoreIds },
      });
    },

    stockItemsByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      return getAllStockItems(physicalStoreId);
    },

    unStockedItemTypesByPhysicalStoreId(obj, { physicalStoreId }, { user }) {
      if (hasInstanceAccess(user._id, physicalStoreId) === false) return [];
      const stockedItemTypes = StockItems.find(
        {
          physicalStoreId: { $eq: physicalStoreId },
        },
        { fields: { itemTypeId: 1 } }
      ).fetch();

      const stockedItemTypeIds = stockedItemTypes.map(
        ({ itemTypeId }) => itemTypeId
      );

      return ItemTypes.find(
        {
          _id: { $nin: stockedItemTypeIds },
        },
        { sort: { name: 1 } }
      );
    },
  },

  Mutation: {
    createStockItem(
      obj,
      { itemTypeId, physicalStoreId, minStockLevel, currentStockLevel },
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
        itemTypeId,
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

    updateStockItem(obj, { _id, minStockLevel }, { user }) {
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
          minStockLevel,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return StockItems.findOne(_id);
    },
  },
};
