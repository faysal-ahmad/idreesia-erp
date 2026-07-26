import { Mongo } from 'meteor/mongo';

import { PhysicalStore as PhysicalStoreSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class PhysicalStores extends Mongo.Collection {
  constructor(name = 'inventory-physical-stores', options = {}) {
    super(name, options);
    this.attachSchema(PhysicalStoreSchema);
  }
}

export default new PhysicalStores();
