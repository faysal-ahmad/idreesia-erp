import { JobTypes } from "meteor/idreesia-common/constants";
import Job from "../common/job";

class CleanupJob extends Job {
  constructor(data = {}) {
    super(JobTypes.CLEANUP_JOB, data);
  }
}

export default CleanupJob;
