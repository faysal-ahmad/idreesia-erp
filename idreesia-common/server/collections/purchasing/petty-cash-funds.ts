import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingPettyCashFund as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingPettyCashFundDocument } from './types';

class PurchasingPettyCashFunds extends AggregatableCollection<PurchasingPettyCashFundDocument> {
  constructor(name = 'purchasing-petty-cash-funds', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingPettyCashFunds();
