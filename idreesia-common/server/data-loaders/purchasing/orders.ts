import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PurchasingOrders } from 'meteor/idreesia-common/server/collections/purchasing';

type LoaderRecord = Record<string, unknown>;

export async function getPurchasingOrders(orderIds: readonly string[]) {
  const docs = await PurchasingOrders.find({
    _id: { $in: orderIds },
  }).fetchAsync();

  const docsMap = keyBy(docs, '_id') as unknown as Record<string, LoaderRecord>;
  return orderIds.map(id => docsMap[id]);
}

export const purchasingOrdersDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPurchasingOrders);
