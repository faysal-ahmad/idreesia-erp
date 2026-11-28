import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SecurityEventKarkun as EventKarkunSchema } from 'meteor/idreesia-common/server/schemas/security';

class SecurityEventKarkuns extends AggregatableCollection {
  constructor(name = 'security-event-karkuns', options = {}) {
    super(name, options);
    this.attachSchema(EventKarkunSchema);
  }
}

export default new SecurityEventKarkuns();
