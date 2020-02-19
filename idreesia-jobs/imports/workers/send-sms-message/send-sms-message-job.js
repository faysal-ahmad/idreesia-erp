/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';
import getHrMessageRecepients from './get-hr-message-recepients';
import getOutstationMessageRecepients from './get-outstation-message-recepients';

const MessageRecepientsEvaluator = {
  [MessageSource.HR]: getHrMessageRecepients,
  [MessageSource.OUTSTATION]: getOutstationMessageRecepients,
};

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
  }

  Messages.update(messageId, {
    $set: {
      status: MessageStatus.SENDING,
    },
  });

  const karkunIds = [];
  const visitorIds = [];
  const phoneNumbers = [];

  const getMessageRecepients = MessageRecepientsEvaluator[message.source];
  return getMessageRecepients(message)
    .then(({ karkuns, visitors }) => {
      karkuns.forEach(({ _id, contactNumber1 }) => {
        if (contactNumber1) {
          karkunIds.push(_id);
          phoneNumbers.push(contactNumber1);
        }
      });

      visitors.forEach(({ _id, contactNumber1 }) => {
        if (contactNumber1) {
          visitorIds.push(_id);
          phoneNumbers.push(contactNumber1);
        }
      });

      return phoneNumbers.reduce(
        (p, phoneNumber) =>
          p.then(() => sendSmsMessage(phoneNumber, message.messageBody)),
        Promise.resolve()
      );
    })
    .then(() => {
      console.log(
        `--> Finished sending ${phoneNumbers.length} SMS Messages`,
        job.data
      );
      Messages.update(messageId, {
        $set: {
          karkunIds,
          visitorIds,
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
