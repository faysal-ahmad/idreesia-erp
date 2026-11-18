import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceDayRecord as Schema } from 'meteor/idreesia-common/server/schemas/duties-attendance';

import type { DutiesAttendanceDayRecordDocument } from './types';

class DutiesAttendanceDayRecords extends AggregatableCollection<DutiesAttendanceDayRecordDocument> {
  constructor(name = 'duties-attendance-day-records', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DutiesAttendanceDayRecords();
