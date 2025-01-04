import XLSX from 'xlsx';

import {
  StockItems,
  ItemCategories,
} from 'meteor/idreesia-common/server/collections/inventory';
import { keyBy } from 'meteor/idreesia-common/utilities/lodash';

export async function exportStockItems(physicalStoreId) {
  // Get all the item categories for this physical store
  const itemCategories = await ItemCategories.find({
    physicalStoreId,
  }).fetchAsync();
  // Create a map by their ids for quick lookup
  const itemCategoriesById = keyBy(itemCategories, '_id');

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

  const sheetData = stockItems.map(stockItem => {
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

  const ws = XLSX.utils.json_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Items');
  const data = XLSX.write(wb, { type: 'buffer' });
  return Buffer.from(data);
}
