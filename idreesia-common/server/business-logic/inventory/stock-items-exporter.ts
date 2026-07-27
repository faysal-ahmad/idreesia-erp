import {
  StockItems,
  ItemCategories,
} from 'meteor/idreesia-common/server/collections/inventory';
import { keyBy } from 'meteor/idreesia-common/utilities/lodash';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

export async function exportStockItems(physicalStoreId: string) {
  // Get all the item categories for this physical store
  const itemCategories = await ItemCategories.find({
    physicalStoreId,
  }).fetchAsync();
  // Create a map by their ids for quick lookup
  const itemCategoriesById = keyBy(itemCategories, '_id') as Record<string, any>;

  // Get all the stock items for this physical store
  const stockItems = await StockItems.find(
    {
      physicalStoreId,
    },
    {
      sort: {
        name: 1,
      },
    }
  ).fetchAsync();

  const sheetData = stockItems.map((stockItem: any) => {
    let currentStockLevel = stockItem.currentStockLevel;
    if (stockItem.unitOfMeasurement !== 'quantity') {
      currentStockLevel = `${currentStockLevel} ${stockItem.unitOfMeasurement}`;
    }

    return {
      Name: stockItem.name,
      Company: stockItem.company,
      Details: stockItem.details,
      Category: itemCategoriesById[stockItem.categoryId]?.name,
      'Current Stock': currentStockLevel,
    };
  });

  return createWorkbookBuffer(sheetData, 'Stock Items');
}
