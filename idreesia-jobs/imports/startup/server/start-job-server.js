import { CleanupJob /* , SendEmailsJob */ } from "imports/models";
import Jobs from "imports/collections/jobs";

Meteor.startup(() =>
  Jobs.startJobServer(null, () => {
    const cleanupJob = new CleanupJob();
    cleanupJob
      .repeat({ schedule: Jobs.later.parse.text("every 10 minutes") })
      .save({ cancelRepeats: true });

    /*
    const sendEmailsJob = new SendEmailsJob();
    sendEmailsJob
      .repeat({ schedule: Jobs.later.parse.text("every 5 minutes") })
      .save({ cancelRepeats: true });
    */
  })
);
