import { Job } from 'meteor/vsivsi:job-collection';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { JobTypes } from 'meteor/idreesia-common/constants';
import Jobs from '/imports/collections/jobs';

export default class extends Job {
  constructor(type, params = {}) {
    const jobTypes = values(JobTypes);
    if (jobTypes.indexOf(type) === -1) {
      throw new Error(`Job of type '${type}' doesn't exist`);
    }
    super(Jobs, type, params);
  }
}
