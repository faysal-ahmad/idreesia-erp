/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';

export const worker = (job, callback) => {
  console.log(`--> Sending Account Creation SMS Message`, job.data);
  const { userId, password, email } = job.data;

  const user = Users.findOneUser(userId);
  if (!user.personId) {
    job.done();
    if (callback) {
      callback();
    }
    return;
  }

  const person = People.findOne(user.personId);
  let contactNumber;
  if (person.sharedData.contactNumber1Subscribed) {
    contactNumber = person.sharedData.contactNumber1;
  } else if (person.sharedData.contactNumber2Subscribed) {
    contactNumber = person.sharedData.contactNumber2;
  }

  if (!contactNumber) {
    job.done();
    if (callback) {
      callback();
    }
    return;
  }

  let message;
  if (email) {
    message = `Your account for Idressia ERP has been created. Visit https://idreesia-erp.com/ and login with your Google Account.`;
  } else {
    message = `Your account for Idressia ERP has been created with username ${user.username} and password ${password}. Visit https://idreesia-erp.com/ to login.`;
  }

  sendSmsMessage(contactNumber, message)
    .then(() => {
      console.log(
        `--> Finished sending Account Creation SMS Message`,
        job.data
      );
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
  JobTypes.SEND_ACCOUNT_CREATED_SMS_MESSAGE,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
