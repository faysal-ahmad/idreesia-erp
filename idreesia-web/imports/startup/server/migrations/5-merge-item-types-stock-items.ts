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
  async up() {
    const adminUser = await Accounts.findUserByUsername('erp-admin');
    if (!adminUser) throw new Error('Admin user not found.');
    const date = new Date();

    // Rename itemCategoryId to categoryId
    let stockItems = await StockItems.find({
      itemCategoryId: { $exists: true },
    }).fetchAsync();
    for (const stockItem of stockItems) {
      await StockItems.updateAsync(stockItem._id, {
        $set: {
          categoryId: stockItem.itemCategoryId,
        },
      });
    }

    // Update existing stock items with attributes from item types
    stockItems = await StockItems.find({
      itemTypeId: { $exists: true },
    }).fetchAsync();
    for (const stockItem of stockItems) {
      const itemType = await ItemTypes.findOneAsync(stockItem.itemTypeId);
      if (!itemType) continue;
      await StockItems.updateAsync(stockItem._id, {
        $set: {
          name: itemType.name,
          company: itemType.company,
          details: itemType.details,
          categoryId: itemType.itemCategoryId,
          unitOfMeasurement: itemType.unitOfMeasurement,
          imageId: itemType.imageId,
        },
      });
    }

    // Create stock items from item types for which stock items do not exist
    const itemTypes = await ItemTypes.find({}).fetchAsync();
    const physicalStores = await PhysicalStores.find({}).fetchAsync();
    for (const physicalStore of physicalStores) {
      for (const itemType of itemTypes) {
        const stockItem = await StockItems.findOneAsync({
          physicalStoreId: physicalStore._id,
          itemTypeId: itemType._id,
        });

        if (!stockItem) {
          await StockItems.insertAsync({
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
      }
    }

    // Remove itemTypeId value from all stock items
    await StockItems.updateAsync(
      {},
      {
        $unset: {
          itemTypeId: '',
        },
      }
    );
  },
});
