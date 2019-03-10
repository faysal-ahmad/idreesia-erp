import { JobCollection } from "meteor/vsivsi:job-collection";
import { isUndefined } from "lodash";

import { JobTypes } from "meteor/idreesia-common/constants";
import {
  CleanupJob,
  SendEmailsJob,
  AccountsImportJob,
  VouchersImportJob,
  AccountsCalculationJob,
} from "imports/models";

const JobModels = {
  [JobTypes.CLEANUP_JOB]: CleanupJob,
  [JobTypes.SEND_EMAILS]: SendEmailsJob,
  [JobTypes.ACCOUNTS_IMPORT]: AccountsImportJob,
  [JobTypes.VOUCHERS_IMPORT]: VouchersImportJob,
  [JobTypes.ACCOUNTS_CALCULATION]: AccountsCalculationJob,
};

class Jobs extends JobCollection {
  constructor(name = "jobs", options = {}) {
    super(name, options);
  }

  create(type, params = {}, options = {}) {
    if (!JobModels[type]) {
      throw new Meteor.Error("not-found", "Job type could not be found.", {
        type,
      });
    }
    const job = new JobModels[type](params);
    const { priority, retry, repeat, delay } = options;

    if (!isUndefined(priority)) job.priority(priority);
    if (!isUndefined(retry)) job.retry(retry);
    if (!isUndefined(repeat)) job.repeat(repeat);
    if (!isUndefined(delay)) job.delay(delay);

    job.save();

    return job._doc._id;
  }

  cancel(selector) {
    const job = this.findOne(selector);
    if (job) job.cancel();
  }
}

export default new Jobs();
