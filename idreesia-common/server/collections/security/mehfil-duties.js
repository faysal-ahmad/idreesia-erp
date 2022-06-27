import { Mongo } from 'meteor/mongo';

import { MehfilDuty as MehfilDutySchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilDuties extends Mongo.Collection {
  constructor(name = 'security-mehfil-duties', options = {}) {
    const mehfilDuties = super(name, options);
    mehfilDuties.attachSchema(MehfilDutySchema);
    return mehfilDuties;
  }
}

export default new MehfilDuties();
