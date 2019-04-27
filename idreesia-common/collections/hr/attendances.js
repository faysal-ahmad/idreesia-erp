import { AggregatableCollection } from "meteor/idreesia-common/collections";
import { Attendance as AttendanceSchema } from "meteor/idreesia-common/schemas/hr";

class Attendances extends AggregatableCollection {
  constructor(name = "hr-attendances", options = {}) {
    const attendances = super(name, options);
    attendances.attachSchema(AttendanceSchema);
    return attendances;
  }
}

export default new Attendances();
