import { Mongo } from 'meteor/mongo';

import { Committee as CommitteeSchema } from 'meteor/idreesia-common/server/schemas/hr';

class Committees extends Mongo.Collection {
  constructor(name = 'hr-committees', options = {}) {
    super(name, options);
    this.attachSchema(CommitteeSchema);
  }
}

export default new Committees();
