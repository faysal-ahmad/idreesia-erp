import { JobTypes } from 'meteor/idreesia-common/constants';
import { AdminJobs } from 'meteor/idreesia-common/collections/admin';

import Jobs from '/imports/collections/jobs';

import importData from './importers/import-data';

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Importing accounts data`, job.data);
  const { adminJobId } = job.data;

  const adminJob = AdminJobs.findOne(adminJobId);
  const jobDetails = JSON.parse(adminJob.jobDetails);

  return importData(adminJob, jobDetails, 'account-heads')
    .then(() => {
      AdminJobs.update(adminJobId, {
        $set: {
          status: adminJob.status,
          logs: adminJob.logs,
          errorDetails: adminJob.errorDetails,
        },
      });
    })
    .finally(() => {
      job.done();
      if (callback) {
        callback();
      }
    });
};

export default Jobs.processJobs(
  JobTypes.ACCOUNTS_IMPORT,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
