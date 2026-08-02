import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { PhysicalStores } from 'meteor/idreesia-common/server/collections/inventory';

type LoaderRecord = Record<string, unknown>;

export async function getPhysicalStores(physicalStoreIds: readonly string[]) {
  const physicalStores = await PhysicalStores.find({
    _id: { $in: physicalStoreIds },
  }).fetchAsync();

  const physicalStoresMap = keyBy(physicalStores, '_id') as Record<
    string,
    LoaderRecord
  >;
  return physicalStoreIds.map(id => physicalStoresMap[id]);
}

export const physicalStoresDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getPhysicalStores);
