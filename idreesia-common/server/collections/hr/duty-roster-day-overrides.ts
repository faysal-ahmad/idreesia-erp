import { Mongo } from 'meteor/mongo';

import { DutyRosterDayOverride as DutyRosterDayOverrideSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyRosterDayOverrides extends Mongo.Collection {
  constructor(name = 'hr-duty-roster-day-overrides', options = {}) {
    super(name, options);
    this.attachSchema(DutyRosterDayOverrideSchema);
  }
}

export default new DutyRosterDayOverrides();
