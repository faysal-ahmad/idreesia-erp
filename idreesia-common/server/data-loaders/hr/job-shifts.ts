import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { JobShifts } from 'meteor/idreesia-common/server/collections/hr';

type LoaderRecord = Record<string, unknown>;

export async function getJobShifts(jobShiftIds: readonly string[]) {
  const shifts = await JobShifts.find({
    _id: { $in: jobShiftIds },
  }).fetchAsync();

  const shiftsMap = keyBy(shifts, '_id') as Record<string, LoaderRecord>;
  return jobShiftIds.map(id => shiftsMap[id]);
}

export const jobShiftsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getJobShifts);
