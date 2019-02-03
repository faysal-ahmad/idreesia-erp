import * as JOB_TYPES from "imports/constants/job-types";

import Jobs from "imports/collections/jobs";

export const worker = (job, callback) => {
  job.done();

  if (callback) {
    callback();
  }
};

export default Jobs.processJobs(
  JOB_TYPES.SEND_EMAILS,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
