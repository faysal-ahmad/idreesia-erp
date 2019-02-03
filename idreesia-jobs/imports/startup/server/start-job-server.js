import { CleanupJob } from "imports/models";
import Jobs from "imports/collections/jobs";

Meteor.startup(() =>
  Jobs.startJobServer(null, () => {
    const cleanupJob = new CleanupJob();
    cleanupJob
      .repeat({ schedule: Jobs.later.parse.text("every 10 minutes") })
      .save({ cancelRepeats: true });
  })
);
