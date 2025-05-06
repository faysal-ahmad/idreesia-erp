import filter from 'lodash/filter';
import DataLoader from 'dataloader';
import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';

export async function getKarkunDuties(karkunIds) {
  const karkunDuties = await KarkunDuties.find({
    karkunId: { $in: karkunIds },
  }).fetchAsync();

  return karkunIds.map(karkunId => {
    return filter(karkunDuties, karkunDuty => {
      return karkunDuty.karkunId === karkunId;
    });
  });
}

export const karkunDutiesDataLoader = () => new DataLoader(getKarkunDuties);
