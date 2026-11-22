import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PurchasingCatalogItem as Schema } from 'meteor/idreesia-common/server/schemas/purchasing';

import type { PurchasingCatalogItemDocument } from './types';

class PurchasingCatalogItems extends AggregatableCollection<PurchasingCatalogItemDocument> {
  constructor(name = 'purchasing-catalog-items', options = {}) {
    super(name, options);
    this.attachSchema(Schema);
  }
}

export default new PurchasingCatalogItems();
