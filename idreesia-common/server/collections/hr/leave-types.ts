import { Mongo } from 'meteor/mongo';

import { LeaveType as LeaveTypeSchema } from 'meteor/idreesia-common/server/schemas/hr';

class LeaveTypes extends Mongo.Collection {
  constructor(name = 'hr-leave-types', options = {}) {
    super(name, options);
    this.attachSchema(LeaveTypeSchema);
  }
}

export default new LeaveTypes();
