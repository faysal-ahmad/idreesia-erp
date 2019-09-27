import { Accounts } from 'meteor/accounts-base';
import { Migrations } from 'meteor/percolate:migrations';
import {
  PhysicalStores,
  ItemTypes,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';

/**
 * This migration takes all the attributes from item types, and updates the stock items
 * with those values.
 * It also iterates through all the item types, and if a stock item does not exist, it
 * creates one for it.
 */
Migrations.add({
  version: 5,
  up() {
    const adminUser = Accounts.findUserByUsername('erp-admin');
    const date = new Date();

    // Rename itemCategoryId to categoryId
    let stockItems = StockItems.find({
      itemCategoryId: { $exists: true },
    }).fetch();
    stockItems.forEach(stockItem => {
      StockItems.update(stockItem._id, {
        $set: {
          categoryId: stockItem.itemCategoryId,
        },
      });
    });

    // Update existing stock items with attributes from item types
    stockItems = StockItems.find({
      itemTypeId: { $exists: true },
    }).fetch();
    stockItems.forEach(stockItem => {
      const itemType = ItemTypes.findOne(stockItem.itemTypeId);
      StockItems.update(stockItem._id, {
        $set: {
          name: itemType.name,
          company: itemType.company,
          details: itemType.details,
          categoryId: itemType.itemCategoryId,
          unitOfMeasurement: itemType.unitOfMeasurement,
          imageId: itemType.imageId,
        },
      });
    });

    // Create stock items from item types for which stock items do not exist
    const itemTypes = ItemTypes.find({}).fetch();
    const physicalStores = PhysicalStores.find({}).fetch();
    physicalStores.forEach(physicalStore => {
      itemTypes.forEach(itemType => {
        const stockItem = StockItems.findOne({
          physicalStoreId: physicalStore._id,
          itemTypeId: itemType._id,
        });

        if (!stockItem) {
          StockItems.insert({
            physicalStoreId: physicalStore._id,
            name: itemType.name,
            company: itemType.company,
            details: itemType.details,
            categoryId: itemType.itemCategoryId,
            unitOfMeasurement: itemType.unitOfMeasurement,
            imageId: itemType.imageId,
            startingStockLevel: 0,
            minStockLevel: 0,
            currentStockLevel: 0,
            totalStockLevel: 0,
            createdAt: date,
            createdBy: adminUser._id,
            updatedAt: date,
            updatedBy: adminUser._id,
          });
        }
      });
    });

    // Remove itemTypeId value from all stock items
    StockItems.update(
      {},
      {
        $unset: {
          itemTypeId: '',
        },
      }
    );
  },
});
