/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import { MessageStatus } from 'meteor/idreesia-common/constants/communication';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';

export const worker = (job, callback) => {
  console.log(`--> Sending SMS Messages`, job.data);
  const { messageId } = job.data;
  const message = Messages.findOne(messageId);
  if (!message) {
    console.error(`No message found against passed messageId.`);
    job.done();
    if (callback) {
      callback();
    }

    return Promise.resolve();
  }

  const karkunIds = message.karkunIds || [];
  const visitorIds = message.visitorIds || [];
  if (karkunIds.length === 0 && visitorIds.length === 0) {
    console.error(`Message has no defined recepients.`);
    job.done();
    if (callback) {
      callback();
    }

    return Promise.resolve();
  }

  Messages.update(messageId, {
    $set: {
      status: MessageStatus.SENDING,
    },
  });

  const phoneNumbers = [];
  const succeededPhoneNumbers = [];
  const failedPhoneNumbers = [];

  const recepientIds = karkunIds.concat(visitorIds);
  const people = People.find({
    _id: { $in: recepientIds },
  });

  people.forEach(({ _id, sharedData: { contactNumber1 } }) => {
    if (contactNumber1) {
      karkunIds.push(_id);
      phoneNumbers.push(contactNumber1);
    }
  });

  return phoneNumbers
    .reduce(
      (p, phoneNumber) =>
        p
          .then(() => sendSmsMessage(phoneNumber, message.messageBody))
          .then(result => {
            if (result.messageSent) {
              succeededPhoneNumbers.push(result.phoneNumber);
            } else {
              failedPhoneNumbers.push(result.phoneNumber);
            }
          }),
      Promise.resolve()
    )
    .then(() => {
      console.log(
        `--> Finished sending ${phoneNumbers.length} SMS Messages`,
        job.data
      );
      Messages.update(messageId, {
        $set: {
          succeededPhoneNumbers,
          failedPhoneNumbers,
          status: MessageStatus.COMPLETED,
          sentDate: new Date(),
        },
      });
    })
    .catch(error => {
      console.log(error);
      Messages.update(messageId, {
        $set: {
          status: MessageStatus.ERRORED,
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
  JobTypes.SEND_SMS_MESSAGE,
  {
    pollInterval: 60 * 1000,
    concurrency: 1,
    workTimeout: 30 * 60 * 1000,
  },
  worker
);
