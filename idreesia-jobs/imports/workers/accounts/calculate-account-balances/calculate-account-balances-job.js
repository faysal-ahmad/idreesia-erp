import { calculateAccountBalances } from "meteor/idreesia-common/business-logic/accounts";
import * as JOB_TYPES from "imports/constants/job-types";
import Jobs from "imports/collections/jobs";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Calculating account balances`, job.data);
  return calculateAccountBalances(job.data).finally(() => {
    job.done();
    if (callback) {
      callback();
    }
  });
};

export default Jobs.processJobs(
  JOB_TYPES.CALCULATE_ACCOUNT_BALANCES,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 10 * 1000,
  },
  worker
);
