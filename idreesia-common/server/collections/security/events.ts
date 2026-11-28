import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityEvent as EventSchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEvents extends AggregatableCollection {
  constructor(name = 'security-events', options = {}) {
    super(name, options);
    this.attachSchema(EventSchema);
  }
}

export default new SecurityEvents();
