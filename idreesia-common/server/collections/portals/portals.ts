import { Mongo } from 'meteor/mongo';

import { Portal as PortalSchema } from 'meteor/idreesia-common/server/schemas/portals';

class Portals extends Mongo.Collection {
  constructor(name = 'portals', options = {}) {
    super(name, options);
    this.attachSchema(PortalSchema);
  }
}

export default new Portals();
