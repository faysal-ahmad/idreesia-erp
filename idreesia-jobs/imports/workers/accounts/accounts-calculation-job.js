import moment from "moment";
import { Formats, JobTypes } from "meteor/idreesia-common/constants";
import { AdminJobs } from "meteor/idreesia-common/collections/admin";
import { calculateAllAccountBalancesFromMonth } from "meteor/idreesia-common/business-logic/accounts";

import Jobs from "imports/collections/jobs";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Calculating account balances`, job.data);
  const { adminJobId } = job.data;

  const adminJob = AdminJobs.findOne(adminJobId);
  const jobDetails = JSON.parse(adminJob.jobDetails);
  const { companyId, startingMonth } = jobDetails;

  try {
    calculateAllAccountBalancesFromMonth(
      companyId,
      moment(startingMonth, Formats.DATE_FORMAT)
    );

    AdminJobs.update(adminJobId, {
      $set: {
        status: "completed",
        logs: adminJob.logs,
        errorDetails: adminJob.errorDetails,
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);
    AdminJobs.update(adminJobId, {
      $set: {
        status: "errored",
        logs: adminJob.logs,
        errorDetails: error.toString(),
      },
    });
  } finally {
    // eslint-disable-next-line no-console
    console.log(`--> Calculating account balances completed`);
    job.done();
    if (callback) {
      callback();
    }
  }
};

export default Jobs.processJobs(
  JobTypes.ACCOUNTS_CALCULATION,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 10 * 1000,
  },
  worker
);
