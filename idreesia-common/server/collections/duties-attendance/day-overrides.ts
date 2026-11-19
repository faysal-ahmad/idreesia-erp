import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DutiesAttendanceDayOverride as Schema } from 'meteor/idreesia-common/server/schemas/duties-attendance';

import type { DutiesAttendanceDayOverrideDocument } from './types';

class DutiesAttendanceDayOverrides extends AggregatableCollection<DutiesAttendanceDayOverrideDocument> {
  constructor(name = 'duties-attendance-day-overrides', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DutiesAttendanceDayOverrides();
