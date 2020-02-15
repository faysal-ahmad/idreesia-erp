import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { AmaanatLog as AmaanatLogSchema } from 'meteor/idreesia-common/server/schemas/outstation';

class AmaanatLogs extends AggregatableCollection {
  constructor(name = 'outstation-amaanat-logs', options = {}) {
    const amaanatLogs = super(name, options);
    amaanatLogs.attachSchema(AmaanatLogSchema);
    return amaanatLogs;
  }
}

export default new AmaanatLogs();
