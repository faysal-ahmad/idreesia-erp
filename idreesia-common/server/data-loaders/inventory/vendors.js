import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Vendors } from 'meteor/idreesia-common/server/collections/inventory';

export async function getVendors(vendorIds) {
  const vendors = await Vendors.find({
    _id: { $in: vendorIds },
  }).fetchAsync();

  const vendorsMap = keyBy(vendors, '_id');
  return vendorIds.map(id => vendorsMap[id]);
}

export const vendorsDataLoader = () => new DataLoader(getVendors);
