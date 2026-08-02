import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Locations } from 'meteor/idreesia-common/server/collections/inventory';

type LoaderRecord = Record<string, unknown>;

export async function getLocations(locationIds: readonly string[]) {
  const locations = await Locations.find({
    _id: { $in: locationIds },
  }).fetchAsync();

  const locationsMap = keyBy(locations, '_id') as Record<string, LoaderRecord>;
  return locationIds.map(id => locationsMap[id]);
}

export const locationsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getLocations);
