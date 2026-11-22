import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PurchasingVendors } from 'meteor/idreesia-common/server/collections/purchasing';

type LoaderRecord = Record<string, unknown>;

export async function getPurchasingVendors(vendorIds: readonly string[]) {
  const docs = await PurchasingVendors.find({
    _id: { $in: vendorIds },
  }).fetchAsync();

  const docsMap = keyBy(docs, '_id') as unknown as Record<string, LoaderRecord>;
  return vendorIds.map(id => docsMap[id]);
}

export const purchasingVendorsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPurchasingVendors);
