import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { StockItems } from 'meteor/idreesia-common/server/collections/inventory';

type LoaderRecord = Record<string, unknown>;

export async function getStockItems(stockItemIds: readonly string[]) {
  const stockItems = await StockItems.find({
    _id: { $in: stockItemIds },
  }).fetchAsync();

  const stockItemsMap = keyBy(stockItems, '_id') as Record<string, LoaderRecord>;
  return stockItemIds.map(id => stockItemsMap[id]);
}

export const stockItemsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getStockItems);
