import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import {
  OrgLocations,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';

export async function getOrgLocations(locationIds: readonly string[]) {
  const locations = await OrgLocations.find({
    _id: { $in: [...locationIds] },
  }).fetchAsync();

  const locationsMap = keyBy(locations, '_id') as Record<
    string,
    OrgLocationDocument
  >;
  return locationIds.map(id => locationsMap[id]);
}

export const orgLocationsDataLoader = () =>
  new DataLoader<string, OrgLocationDocument | undefined>(getOrgLocations);
