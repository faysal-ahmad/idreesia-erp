import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Locations } from 'meteor/idreesia-common/server/collections/inventory';

export async function getLocations(locationIds) {
  const locations = await Locations.find({
    _id: { $in: locationIds },
  }).fetchAsync();

  const locationsMap = keyBy(locations, '_id');
  return locationIds.map(id => locationsMap[id]);
}

export const locationsDataLoader = () => new DataLoader(getLocations);
