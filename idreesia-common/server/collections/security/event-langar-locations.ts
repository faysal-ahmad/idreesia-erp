import { Mongo } from 'meteor/mongo';

import { SecurityEventLangarLocation as EventLangarLocationSchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEventLangarLocations extends Mongo.Collection {
  constructor(name = 'security-event-langar-locations', options = {}) {
    super(name, options);
    this.attachSchema(EventLangarLocationSchema);
  }
}

export default new SecurityEventLangarLocations();
