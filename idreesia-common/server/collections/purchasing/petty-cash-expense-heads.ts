import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingPettyCashExpenseHead as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingPettyCashExpenseHeadDocument } from './types';

class PurchasingPettyCashExpenseHeads extends AggregatableCollection<PurchasingPettyCashExpenseHeadDocument> {
  constructor(name = 'purchasing-petty-cash-expense-heads', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingPettyCashExpenseHeads();
