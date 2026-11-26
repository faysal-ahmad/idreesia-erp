import { Mongo } from 'meteor/mongo';

import { SecurityEventLangarDetail as EventLangarDetailSchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEventLangarDetails extends Mongo.Collection {
  constructor(name = 'security-event-langar-details', options = {}) {
    super(name, options);
    this.attachSchema(EventLangarDetailSchema);
  }
}

export default new SecurityEventLangarDetails();
