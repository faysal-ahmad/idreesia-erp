import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Vendors } from 'meteor/idreesia-common/server/collections/inventory';

type LoaderRecord = Record<string, unknown>;

export async function getVendors(vendorIds: readonly string[]) {
  const vendors = await Vendors.find({
    _id: { $in: vendorIds },
  }).fetchAsync();

  const vendorsMap = keyBy(vendors, '_id') as Record<string, LoaderRecord>;
  return vendorIds.map(id => vendorsMap[id]);
}

export const vendorsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getVendors);
