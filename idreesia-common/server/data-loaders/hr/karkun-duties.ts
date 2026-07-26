import filter from 'lodash/filter';
import DataLoader from 'dataloader';
import { KarkunDuties } from 'meteor/idreesia-common/server/collections/hr';

interface KarkunDutyRecord extends Record<string, unknown> {
  karkunId?: string;
}

export async function getKarkunDuties(karkunIds: readonly string[]) {
  const karkunDuties = await KarkunDuties.find({
    karkunId: { $in: karkunIds },
  }).fetchAsync();

  return karkunIds.map(karkunId => {
    return filter(karkunDuties as KarkunDutyRecord[], karkunDuty => {
      return karkunDuty.karkunId === karkunId;
    });
  });
}

export const karkunDutiesDataLoader = () =>
  new DataLoader<string, KarkunDutyRecord[]>(getKarkunDuties);
