import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { toString } from "lodash";

const { jobsAppUrl } = Meteor.settings.private;

export const remoteCall = (methodName, args = {}, callback) => {
  if (Meteor.isClient) return;

  if (!jobsAppUrl) {
    console.warn(
      "jobsAppUrl not in Meteor.settings; jobs will not be enqueued."
    );
    return;
  }

  const remote = DDP.connect(jobsAppUrl);
  remote.call(methodName, args, (error, result) => {
    if (error) {
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
