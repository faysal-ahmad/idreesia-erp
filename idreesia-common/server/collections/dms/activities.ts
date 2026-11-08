import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { DmsActivity as Schema } from 'meteor/idreesia-common/server/schemas/dms';

import type { DmsActivityDocument } from './types';

class DmsActivities extends AggregatableCollection<DmsActivityDocument> {
  constructor(name = 'dms-activities', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new DmsActivities();
