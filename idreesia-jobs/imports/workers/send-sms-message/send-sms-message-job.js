/* eslint "no-console": "off" */
import { JobTypes } from 'meteor/idreesia-common/constants';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  FilterTarget,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';

import Jobs from '/imports/collections/jobs';
import sendSmsMessage from './send-sms-message';
import getMsKarkunMessageRecepients from './get-ms-karkun-message-recepients';
import getOutstationKarkunMessageRecepients from './get-outstation-karkun-message-recepients';

const MessageRecepientsEvaluator = {
  [FilterTarget.MS_KARKUNS]: getMsKarkunMessageRecepients,
  [FilterTarget.OUTSTATION_KARKUNS]: getOutstationKarkunMessageRecepients,
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

    return Promise.resolve();
  }

  const { recepientFilters } = message;
  if (!recepientFilters || recepientFilters.length === 0) {
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

  const karkunIds = [];
  const visitorIds = [];
  const phoneNumbers = [];

  const recepientFilter = recepientFilters[0];
  const getMessageRecepients =
    MessageRecepientsEvaluator[recepientFilter.filterTarget];
  return getMessageRecepients(recepientFilter)
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
