import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

export async function getStockItems(stockItemIds) {
  const stockItems = await StockItems.find({
    _id: { $in: stockItemIds },
  }).fetchAsync();

  const stockItemsMap = keyBy(stockItems, '_id');
  return stockItemIds.map(id => stockItemsMap[id]);
}

export const stockItemsDataLoader = () => new DataLoader(getStockItems);
