import { Mongo } from 'meteor/mongo';

import { DutyDayAttendance as DutyDayAttendanceSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyDayAttendances extends Mongo.Collection {
  constructor(name = 'hr-duty-day-attendances', options = {}) {
    super(name, options);
    this.attachSchema(DutyDayAttendanceSchema);
  }
}

export default new DutyDayAttendances();
