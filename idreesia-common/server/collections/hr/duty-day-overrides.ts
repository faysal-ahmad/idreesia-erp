import { Mongo } from 'meteor/mongo';

import { DutyDayOverride as DutyDayOverrideSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyDayOverrides extends Mongo.Collection {
  constructor(name = 'hr-duty-day-overrides', options = {}) {
    super(name, options);
    this.attachSchema(DutyDayOverrideSchema);
  }
}

export default new DutyDayOverrides();
