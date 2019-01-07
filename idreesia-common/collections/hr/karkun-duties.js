import { Mongo } from 'meteor/mongo';

import { KarkunDuty as KarkunDutySchema } from 'meteor/idreesia-common/schemas/hr';

class KarkunDuties extends Mongo.Collection {
  constructor(name = 'hr-karkun-duties', options = {}) {
    const karkunDuties = super(name, options);
    karkunDuties.attachSchema(KarkunDutySchema);
    return karkunDuties;
  }
}

export default new KarkunDuties();
