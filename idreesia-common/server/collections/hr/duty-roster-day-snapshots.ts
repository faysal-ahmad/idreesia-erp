import { Mongo } from 'meteor/mongo';

import { DutyRosterDaySnapshot as DutyRosterDaySnapshotSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyRosterDaySnapshots extends Mongo.Collection {
  constructor(name = 'hr-duty-roster-day-snapshots', options = {}) {
    super(name, options);
    this.attachSchema(DutyRosterDaySnapshotSchema);
  }
}

export default new DutyRosterDaySnapshots();
