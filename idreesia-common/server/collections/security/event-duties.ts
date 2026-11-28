import { Mongo } from 'meteor/mongo';

import { SecurityEventDuty as EventDutySchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEventDuties extends Mongo.Collection {
  constructor(name = 'security-event-duties', options = {}) {
    super(name, options);
    this.attachSchema(EventDutySchema);
  }
}

export default new SecurityEventDuties();
