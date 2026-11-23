import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingQuote as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingQuoteDocument } from './types';

class PurchasingQuotes extends AggregatableCollection<PurchasingQuoteDocument> {
  constructor(name = 'purchasing-quotes', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingQuotes();
