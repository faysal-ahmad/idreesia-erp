import { Mongo } from 'meteor/mongo';

import { DutyShift as DutyShiftSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyShifts extends Mongo.Collection {
  constructor(name = 'hr-duty-shifts', options = {}) {
    super(name, options);
    this.attachSchema(DutyShiftSchema);
  }
}

export default new DutyShifts();
