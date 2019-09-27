import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Attendance as AttendanceSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Attendances extends AggregatableCollection {
  constructor(name = 'hr-attendances', options = {}) {
    const attendances = super(name, options);
    attendances.attachSchema(AttendanceSchema);
    return attendances;
  }
}

export default new Attendances();
