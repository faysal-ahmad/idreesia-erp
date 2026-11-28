import { Mongo } from 'meteor/mongo';

import { LeaveAdjustment as LeaveAdjustmentSchema } from 'meteor/idreesia-common/server/schemas/hr';

class LeaveAdjustments extends Mongo.Collection {
  constructor(name = 'hr-leave-adjustments', options = {}) {
    super(name, options);
    this.attachSchema(LeaveAdjustmentSchema);
  }
}

export default new LeaveAdjustments();
