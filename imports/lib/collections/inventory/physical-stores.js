import { Mongo } from 'meteor/mongo';

import { PhysicalStore as PhysicalStoreSchema } from '../../schemas/inventory';

class PhysicalStores extends Mongo.Collection {
  constructor(name, options = {}) {
    const physicalStores = super('inventory-physical-stores', options);
    physicalStores.attachSchema(PhysicalStoreSchema);
    return physicalStores;
  }
}

export default new PhysicalStores();
