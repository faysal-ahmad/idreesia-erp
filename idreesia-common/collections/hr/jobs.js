import { Mongo } from "meteor/mongo";

import { Job as JobSchema } from "meteor/idreesia-common/schemas/hr";

class Jobs extends Mongo.Collection {
  constructor(name = "hr-jobs", options = {}) {
    const jobs = super(name, options);
    jobs.attachSchema(JobSchema);
    return jobs;
  }
}

export default new Jobs();
