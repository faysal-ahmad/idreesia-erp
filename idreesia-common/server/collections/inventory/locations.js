import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Location as LocationSchema } from 'meteor/idreesia-common/server/schemas/inventory';

class Locations extends AggregatableCollection {
  constructor(name = 'inventory-locations', options = {}) {
    const locations = super(name, options);
    locations.attachSchema(LocationSchema);
    return locations;
  }
}

export default new Locations();
