import { Job } from "meteor/vsivsi:job-collection";

import * as JOB_TYPES from "imports/constants/job-types";
import Jobs from "imports/collections/jobs";

export default class extends Job {
  constructor(type, params = {}) {
    if (!JOB_TYPES[type]) {
      throw new Error(`Job of type '${type}' doesn't exist`);
    }
    super(Jobs, type, params);
  }
}
