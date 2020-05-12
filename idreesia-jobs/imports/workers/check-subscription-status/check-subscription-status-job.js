/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

import Jobs from '/imports/collections/jobs';
import checkSubscriptionStatus from './check-subscription-status';

export const worker = (job, callback) => {
  const karkuns = Karkuns.find({
    $or: [
      {
        contactNumber1: { $exists: true, $ne: null },
        contactNumber1Subscribed: { $ne: true },
      },
      {
        contactNumber2: { $exists: true, $ne: null },
        contactNumber2Subscribed: { $ne: true },
      },
    ],
  }).fetch();
  console.log(
    `--> Checking Subscription Status for ${karkuns.length} Karkuns.`
  );

  return karkuns
    .reduce(
      (p, karkun) => p.then(() => checkSubscriptionStatus(karkun)),
      Promise.resolve()
    )
    .then(() => {
      console.log(`--> Finished Checking Subscription Status.`);
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
  JobTypes.CHECK_SUBSCRIPTION_STATUS,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
