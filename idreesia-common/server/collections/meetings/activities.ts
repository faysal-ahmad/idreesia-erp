import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { MeetingsActivity as Schema } from 'meteor/idreesia-common/server/schemas/meetings';

import type { MeetingsActivityDocument } from './types';

class MeetingsActivities extends AggregatableCollection<MeetingsActivityDocument> {
  constructor(name = 'meetings-activities', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new MeetingsActivities();
