import { Mongo } from 'meteor/mongo';

import { DutyRoster as DutyRosterSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyRosters extends Mongo.Collection {
  constructor(name = 'hr-duty-rosters', options = {}) {
    super(name, options);
    this.attachSchema(DutyRosterSchema);
  }
}

export default new DutyRosters();
