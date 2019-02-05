import mjmltohtml from "mjml";

import * as JOB_TYPES from "imports/constants/job-types";
import { PhysicalStores } from "meteor/idreesia-common/collections/inventory";

import Jobs from "imports/collections/jobs";
import sendEmail from "./sendgrid/send-email";
import getDailyInventorySummaryForStore from "./email-templates/get-daily-inventory-summary";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Sending emails`);

  const physicalStores = PhysicalStores.find({}).fetch();
  const promises = physicalStores.map(physicalStore => {
    const template = getDailyInventorySummaryForStore(physicalStore._id);
    const html = mjmltohtml(template).html;

    const recepients = [
      { email: "faisal.idreesi@gmail.com", name: "Faisal Ahmad" },
      { email: "381hrd@gmail.com", name: "Raheel Khan" },
    ];

    return sendEmail({
      from: "erp-server@idreesia.org",
      to: recepients,
      replyTo: "no-reply@idreesia.org",
      subject: `Inventory Summary for ${physicalStore.name}`,
      html,
    });
  });

  return Promise.all(promises)
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
