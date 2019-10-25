import { Mongo } from 'meteor/mongo';

import { DutyLocation as DutyLocationSchema } from 'meteor/idreesia-common/server/schemas/hr';

class DutyLocations extends Mongo.Collection {
  constructor(name = 'hr-duty-locations', options = {}) {
    const dutyLocations = super(name, options);
    dutyLocations.attachSchema(DutyLocationSchema);
    return dutyLocations;
  }
}

export default new DutyLocations();
