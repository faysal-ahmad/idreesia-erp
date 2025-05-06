import keyBy from 'lodash/keyBy';
import DataLoader from 'dataloader';
import { Jobs } from 'meteor/idreesia-common/server/collections/hr';

export async function getJobs(jobIds) {
  const jobs = await Jobs.find({
    _id: { $in: jobIds },
  }).fetchAsync();

  const jobsMap = keyBy(jobs, '_id');
  return jobIds.map(id => jobsMap[id]);
}

export const jobsDataLoader = () => new DataLoader(getJobs);
