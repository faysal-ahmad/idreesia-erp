import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceDuty as Schema } from 'meteor/idreesia-common/server/schemas/duties-attendance';

import type { DutiesAttendanceDutyDocument } from './types';

class DutiesAttendanceDuties extends AggregatableCollection<DutiesAttendanceDutyDocument> {
  constructor(name = 'duties-attendance-duties', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DutiesAttendanceDuties();
