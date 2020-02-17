/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  MessageSource,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';
import getOutstationMessageRecepients from './get-outstation-message-recepients';

const MessageRecepientsEvaluator = {
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

  const getMessageRecepients = MessageRecepientsEvaluator[message.source];
  return getMessageRecepients(message)
    .then(({ karkuns, visitors }) => {
      const karkunPromises = karkuns.map(({ _id, contactNumber1 }) => {
        karkunIds.push(_id);
        return sendSmsMessage(contactNumber1, message.messageBody);
      });

      const visitorPromises = visitors.map(({ _id, contactNumber1 }) => {
        visitorIds.push(_id);
        return sendSmsMessage(contactNumber1, message.messageBody);
      });

      return Promise.all(karkunPromises.concat(visitorPromises));
    })
    .then(() => {
      Messages.update(messageId, {
        $set: {
          karkunIds,
          visitorIds,
          status: MessageStatus.COMPLETED,
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
