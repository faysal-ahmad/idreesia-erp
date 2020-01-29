import { Mongo } from 'meteor/mongo';

import { Portal as PortalSchema } from 'meteor/idreesia-common/server/schemas/portals';

class Portals extends Mongo.Collection {
  constructor(name = 'portals', options = {}) {
    const portals = super(name, options);
    portals.attachSchema(PortalSchema);
    return portals;
  }
}

export default new Portals();
