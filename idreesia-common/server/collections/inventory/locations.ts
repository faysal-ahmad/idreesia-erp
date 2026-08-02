import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Location as LocationSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class Locations extends AggregatableCollection {
  constructor(name = 'inventory-locations', options = {}) {
    super(name, options);
    this.attachSchema(LocationSchema);
  }
}

export default new Locations();
