/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { People } from 'meteor/idreesia-common/server/collections/common';

import Jobs from '/imports/collections/jobs';
import checkSubscriptionStatus from './check-subscription-status';

export const worker = (job, callback) => {
  console.log(`--> Checking Subscription Status of Karkun`, job.data);
  const { karkunId } = job.data;
  const person = People.findOne(karkunId);

  return checkSubscriptionStatus(person)
    .then(() => {
      console.log(`--> Finished Checking Subscription Status of Karkun.`);
    })
    .catch(error => {
      console.log(error);
    })
    .finally(() => {
      job.done();
      if (callback) {
        callback();
      }
    });
};

export default Jobs.processJobs(
  JobTypes.CHECK_SUBSCRIPTION_STATUS_NOW,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
