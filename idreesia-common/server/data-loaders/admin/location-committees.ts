import DataLoader from 'dataloader';
import { Committees } from 'meteor/idreesia-common/server/collections/admin';

interface CommitteeRecord extends Record<string, unknown> {
  name?: string;
  locationId?: string;
}

// The committees made under each location, sorted by name.
export async function getLocationCommittees(locationIds: readonly string[]) {
  const committees = (await Committees.find(
    { locationId: { $in: [...locationIds] } },
    { sort: { name: 1 } }
  ).fetchAsync()) as CommitteeRecord[];

  return locationIds.map(locationId =>
    committees.filter(committee => committee.locationId === locationId)
  );
}

export const locationCommitteesDataLoader = () =>
  new DataLoader<string, CommitteeRecord[]>(getLocationCommittees);
