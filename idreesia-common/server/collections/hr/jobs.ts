import { Mongo } from 'meteor/mongo';

import { Job as JobSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Jobs extends Mongo.Collection {
  constructor(name = 'hr-jobs', options = {}) {
    super(name, options);
    this.attachSchema(JobSchema);
  }
}

export default new Jobs();
