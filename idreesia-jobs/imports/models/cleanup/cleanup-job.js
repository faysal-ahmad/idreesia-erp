import * as JOB_TYPES from "imports/constants/job-types";
import Job from "../common/job";

class CleanupJob extends Job {
  constructor(data = {}) {
    super(JOB_TYPES.CLEANUP_JOB, data);
  }
}

export default CleanupJob;
