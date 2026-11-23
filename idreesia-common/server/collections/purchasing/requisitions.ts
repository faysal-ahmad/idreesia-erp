import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingRequisition as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingRequisitionDocument } from './types';

class PurchasingRequisitions extends AggregatableCollection<PurchasingRequisitionDocument> {
  constructor(name = 'purchasing-requisitions', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingRequisitions();
