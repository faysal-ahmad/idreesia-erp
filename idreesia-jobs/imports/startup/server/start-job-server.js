import Jobs from '/imports/collections/jobs';
import {
  CleanupJob,
  SendEmailsJob,
  CheckSubscriptionStatusJob,
} from '/imports/models';

Meteor.startup(() =>
  Jobs.startJobServer(null, () => {
    const cleanupJob = new CleanupJob();
    cleanupJob
      .repeat({ schedule: Jobs.later.parse.text('every 10 minutes') })
      .save({ cancelRepeats: true });

    const sendEmailsJob = new SendEmailsJob();
    sendEmailsJob
      .repeat({ schedule: Jobs.later.parse.text('at 4:00 am') })
      .save({ cancelRepeats: true });

    const checkSubscriptionStatusJob = new CheckSubscriptionStatusJob();
    checkSubscriptionStatusJob
      .repeat({ schedule: Jobs.later.parse.text('at 3:00 am') })
      .save({ cancelRepeats: true });
  })
);
