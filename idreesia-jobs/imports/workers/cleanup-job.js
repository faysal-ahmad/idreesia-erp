import * as JOB_TYPES from "imports/constants/job-types";
import { Job } from "meteor/vsivsi:job-collection";

import Jobs from "imports/collections/jobs";

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
  JOB_TYPES.CLEANUP_JOB,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
