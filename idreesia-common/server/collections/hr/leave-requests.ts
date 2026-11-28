import { Mongo } from 'meteor/mongo';

import { LeaveRequest as LeaveRequestSchema } from 'meteor/idreesia-common/server/schemas/hr';

class LeaveRequests extends Mongo.Collection {
  constructor(name = 'hr-leave-requests', options = {}) {
    super(name, options);
    this.attachSchema(LeaveRequestSchema);
  }
}

export default new LeaveRequests();
