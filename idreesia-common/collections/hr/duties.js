import { Mongo } from 'meteor/mongo';

import { Duty as DutySchema } from 'meteor/idreesia-common/schemas/hr';

class Duties extends Mongo.Collection {
  constructor(name = 'hr-duties', options = {}) {
    const duties = super(name, options);
    duties.attachSchema(DutySchema);
    return duties;
  }
}

export default new Duties();
