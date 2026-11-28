import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingPettyCashVoucher as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingPettyCashVoucherDocument } from './types';

class PurchasingPettyCashVouchers extends AggregatableCollection<PurchasingPettyCashVoucherDocument> {
  constructor(name = 'purchasing-petty-cash-vouchers', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingPettyCashVouchers();
