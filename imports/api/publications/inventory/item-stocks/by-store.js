import { ItemStocks } from '/imports/lib/collections/inventory';

export default function byStore({ physicalStoreId }) {
  return ItemStocks.find({
    physicalStoreId: { $eq: physicalStoreId }
  });
}
