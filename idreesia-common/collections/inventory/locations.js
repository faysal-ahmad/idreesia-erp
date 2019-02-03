import { AggregatableCollection } from "meteor/idreesia-common/collections";

import { Location as LocationSchema } from "../../schemas/inventory";

class Locations extends AggregatableCollection {
  constructor(name = "inventory-locations", options = {}) {
    const locations = super(name, options);
    locations.attachSchema(LocationSchema);
    return locations;
  }
}

export default new Locations();
