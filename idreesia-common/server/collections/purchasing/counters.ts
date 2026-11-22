import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingCounter as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingCounterDocument } from './types';

class PurchasingCounters extends AggregatableCollection<PurchasingCounterDocument> {
  constructor(name = 'purchasing-counters', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingCounters();
