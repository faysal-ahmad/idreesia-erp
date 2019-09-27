import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { KarkunDuty as KarkunDutySchema } from 'meteor/idreesia-common/server/schemas/hr';

class KarkunDuties extends AggregatableCollection {
  constructor(name = 'hr-karkun-duties', options = {}) {
    const karkunDuties = super(name, options);
    karkunDuties.attachSchema(KarkunDutySchema);
    return karkunDuties;
  }
}

export default new KarkunDuties();
