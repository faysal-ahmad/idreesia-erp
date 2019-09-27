import { Mongo } from 'meteor/mongo';

import { PhysicalStore as PhysicalStoreSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class PhysicalStores extends Mongo.Collection {
  constructor(name = 'inventory-physical-stores', options = {}) {
    const physicalStores = super(name, options);
    physicalStores.attachSchema(PhysicalStoreSchema);
    return physicalStores;
  }
}

export default new PhysicalStores();
