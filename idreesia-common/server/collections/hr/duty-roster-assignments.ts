import { Mongo } from 'meteor/mongo';

import { DutyRosterAssignment as DutyRosterAssignmentSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyRosterAssignments extends Mongo.Collection {
  constructor(name = 'hr-duty-roster-assignments', options = {}) {
    super(name, options);
    this.attachSchema(DutyRosterAssignmentSchema);
  }
}

export default new DutyRosterAssignments();
