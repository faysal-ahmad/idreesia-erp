import { Mongo } from 'meteor/mongo';

import { Duty as DutySchema } from 'meteor/idreesia-common/server/schemas/hr';

class Duties extends Mongo.Collection {
  constructor(name = 'hr-duties', options = {}) {
    super(name, options);
    this.attachSchema(DutySchema);
  }
}

export default new Duties();
