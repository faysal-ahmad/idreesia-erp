import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';

export async function getPhysicalStores(physicalStoreIds) {
  const physicalStores = await PhysicalStores.find({
    _id: { $in: physicalStoreIds },
  }).fetchAsync();

  const physicalStoresMap = keyBy(physicalStores, '_id');
  return physicalStoreIds.map(id => physicalStoresMap[id]);
}

export const physicalStoresDataLoader = () => new DataLoader(getPhysicalStores);
