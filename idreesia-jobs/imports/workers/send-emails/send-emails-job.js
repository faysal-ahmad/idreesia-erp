import * as JOB_TYPES from "imports/constants/job-types";

import Jobs from "imports/collections/jobs";
import sendEmail from "./sendgrid/send-email";

const apiKey = Meteor.settings.private.emailProviderKey;

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Sending emails`);

  sendEmail(
    {
      from: "server@idreesia-erp.org",
      to: "faisal.idreesi@gmail.com",
      replyTo: "no-reply@idreesia-erp.org",
      subject: "Inventory Summary",
      html: "Here is your inventory summary.",
    },
    { apiKey }
  )
    .catch(error => {
      // eslint-disable-next-line no-console
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
  JOB_TYPES.SEND_EMAILS,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
