import { Mongo } from 'meteor/mongo';

import { MehfilDuty as MehfilDutySchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilDuties extends Mongo.Collection {
  constructor(name = 'security-mehfil-duties', options = {}) {
    super(name, options);
    this.attachSchema(MehfilDutySchema);
  }
}

export default new MehfilDuties();
