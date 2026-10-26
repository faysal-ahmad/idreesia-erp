import { Mongo } from 'meteor/mongo';

import { DutyTeamAssignment as DutyTeamAssignmentSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyTeamAssignments extends Mongo.Collection {
  constructor(name = 'hr-duty-team-assignments', options = {}) {
    super(name, options);
    this.attachSchema(DutyTeamAssignmentSchema);
  }
}

export default new DutyTeamAssignments();
