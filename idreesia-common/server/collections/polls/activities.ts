import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PollsActivity as Schema } from 'meteor/idreesia-common/server/schemas/polls';

import type { PollsActivityDocument } from './types';

class PollsActivities extends AggregatableCollection<PollsActivityDocument> {
  constructor(name = 'polls-activities', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PollsActivities();
