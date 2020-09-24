/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';

export const worker = (job, callback) => {
  console.log(`--> Sending Password Reset SMS Message`, job.data);
  const { userId, password } = job.data;

  const user = Users.findOneUser(userId);
  if (!user.karkunId) {
    job.done();
    if (callback) {
      callback();
    }
  }

  const karkun = Karkuns.findOne(user.karkunId);
  let contactNumber;
  if (karkun.contactNumber1Subscribed) {
    contactNumber = karkun.contactNumber1;
  } else if (karkun.contactNumber2Subscribed) {
    contactNumber = karkun.contactNumber2;
  }

  if (!contactNumber) {
    job.done();
    if (callback) {
      callback();
    }
  }

  const message = `Your password for Idressia ERP has been reset to ${password}`;
  sendSmsMessage(contactNumber, message)
    .then(() => {
      console.log(`--> Finished sending Password Reset Message`, job.data);
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
  JobTypes.SEND_PASSWORD_RESET_SMS_MESSAGE,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
