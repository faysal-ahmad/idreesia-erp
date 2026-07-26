import { Mongo } from 'meteor/mongo';

import { DutyLocation as DutyLocationSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyLocations extends Mongo.Collection {
  constructor(name = 'hr-duty-locations', options = {}) {
    super(name, options);
    this.attachSchema(DutyLocationSchema);
  }
}

export default new DutyLocations();
