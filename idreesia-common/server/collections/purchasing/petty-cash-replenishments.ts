import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingPettyCashReplenishment as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingPettyCashReplenishmentDocument } from './types';

class PurchasingPettyCashReplenishments extends AggregatableCollection<PurchasingPettyCashReplenishmentDocument> {
  constructor(name = 'purchasing-petty-cash-replenishments', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingPettyCashReplenishments();
