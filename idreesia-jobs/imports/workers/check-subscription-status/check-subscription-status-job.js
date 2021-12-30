/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { People } from 'meteor/idreesia-common/server/collections/common';

import Jobs from '/imports/collections/jobs';
import checkSubscriptionStatus from './check-subscription-status';

export const worker = (job, callback) => {
  const people = People.find({
    $and: [
      {
        $or: [{ isKarkun: true }, { isEmployee: true }],
      },
      {
        $or: [
          {
            'sharedData.contactNumber1': { $exists: true, $ne: null },
            'sharedData.contactNumber1Subscribed': { $ne: true },
          },
          {
            'sharedData.contactNumber2': { $exists: true, $ne: null },
            'sharedData.contactNumber2Subscribed': { $ne: true },
          },
        ],
      },
    ],
  }).fetch();
  console.log(`--> Checking Subscription Status for ${people.length} Karkuns.`);

  return people
    .reduce(
      (p, person) => p.then(() => checkSubscriptionStatus(person)),
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
