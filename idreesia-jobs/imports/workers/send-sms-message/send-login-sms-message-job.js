/* eslint "no-console": "off" */
import moment from 'moment';
import { JobTypes } from 'meteor/idreesia-common/constants';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { Formats } from 'meteor/idreesia-common/constants';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';

export const worker = (job, callback) => {
  console.log(`--> Sending Login SMS Messages`, job.data);
  const { userId } = job.data;

  const user = Users.findOneUser(userId);
  if (!user.personId) {
    job.done();
    if (callback) {
      callback();
    }
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
  }

  const timeStamp = moment().format(Formats.DATE_TIME_FORMAT);
  const message = `You successfully logged into Idressia ERP at ${timeStamp}`;
  sendSmsMessage(contactNumber, message)
    .then(() => {
      console.log(`--> Finished sending Login SMS Messages`, job.data);
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
  JobTypes.SEND_LOGIN_SMS_MESSAGE,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
