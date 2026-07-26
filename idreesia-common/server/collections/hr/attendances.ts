import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Attendance as AttendanceSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Attendances extends AggregatableCollection {
  constructor(name = 'hr-attendances', options = {}) {
    super(name, options);
    this.attachSchema(AttendanceSchema);
  }
}

export default new Attendances();
