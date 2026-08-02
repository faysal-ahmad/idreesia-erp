import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Jobs } from 'meteor/idreesia-common/server/collections/hr';

type LoaderRecord = Record<string, unknown>;

export async function getJobs(jobIds: readonly string[]) {
  const jobs = await Jobs.find({
    _id: { $in: jobIds },
  }).fetchAsync();

  const jobsMap = keyBy(jobs, '_id') as Record<string, LoaderRecord>;
  return jobIds.map(id => jobsMap[id]);
}

export const jobsDataLoader = () =>
  new DataLoader<string, LoaderRecord | undefined>(getJobs);
