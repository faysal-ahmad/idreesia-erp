import { Mongo } from 'meteor/mongo';

import { DutyShift as DutyShiftSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyShifts extends Mongo.Collection {
  constructor(name = 'hr-duty-shifts', options = {}) {
    const dutyShifts = super(name, options);
    dutyShifts.attachSchema(DutyShiftSchema);
    return dutyShifts;
  }
}

export default new DutyShifts();
