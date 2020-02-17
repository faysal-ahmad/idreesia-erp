import { JobTypes } from 'meteor/idreesia-common/constants';
import { Job } from 'meteor/vsivsi:job-collection';

import Jobs from '/imports/collections/jobs';

export const worker = (job, callback) => {
  const jobIds = Jobs.find({ status: { $in: Job.jobStatusRemovable } }).map(
    doc => doc._id
  );

  if (jobIds.length > 0) {
    Jobs.removeJobs(jobIds);
    // eslint-disable-next-line no-console
    console.log(`--> Cleaned ${jobIds.length} finished jobs`);
  }

  job.done();
  callback();
};

export default Jobs.processJobs(
  JobTypes.CLEANUP_JOB,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
