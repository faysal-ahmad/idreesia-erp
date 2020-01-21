import { Meteor } from 'meteor/meteor';
import { DDP } from 'meteor/ddp-client';
import { toString } from 'lodash';

export const remoteCall = (methodName, args = {}, callback) => {
  if (Meteor.isClient) return;
  const jobsAppUrl = Meteor.settings.private.jobsAppUrl;

  if (!jobsAppUrl) {
    // eslint-disable-next-line no-console
    console.warn(
      'jobsAppUrl not in Meteor.settings; jobs will not be enqueued.'
    );
    return;
  }

  const remote = DDP.connect(jobsAppUrl);
  remote.call(methodName, args, (error, result) => {
    if (error) {
      // eslint-disable-next-line no-console
      console.error(
        `Error in remote call of ${methodName} result was ${result} with args ${toString(
          args
        )}:`,
        error
      );
    }
    if (callback) {
      callback(error, result);
    }

    remote.disconnect();
  });
};
