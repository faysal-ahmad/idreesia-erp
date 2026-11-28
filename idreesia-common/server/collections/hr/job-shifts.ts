import { Mongo } from 'meteor/mongo';

import { JobShift as JobShiftSchema } from 'meteor/idreesia-common/server/schemas/hr';

class JobShifts extends Mongo.Collection {
  constructor(name = 'hr-job-shifts', options = {}) {
    super(name, options);
    this.attachSchema(JobShiftSchema);
  }
}

export default new JobShifts();
