import mjmltohtml from "mjml";

import { JobTypes } from "meteor/idreesia-common/constants";
import { PhysicalStores } from "meteor/idreesia-common/collections/inventory";

import Jobs from "imports/collections/jobs";
import sendEmail from "./sendgrid/send-email";
import getDailySummary from "./email-templates/daily-summary-report/get-daily-summary";

export const worker = (job, callback) => {
  // eslint-disable-next-line no-console
  console.log(`--> Sending emails`);

  const physicalStores = PhysicalStores.find({}).fetch();
  const promises = physicalStores.map(physicalStore => {
    const template = getDailySummary(physicalStore._id);
    const html = mjmltohtml(template).html;

    const recepients = [
      { email: "faisal.idreesi@gmail.com", name: "Faisal Ahmad" },
      { email: "naeemyahya@gmail.com", name: "Dr. Yahya Naeem" },
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
  JobTypes.SEND_EMAILS,
  {
    pollInterval: 500,
    concurrency: 1,
    workTimeout: 10 * 1000,
  },
  worker
);
