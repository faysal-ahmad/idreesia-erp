import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { KarkunDuty as KarkunDutySchema } from 'meteor/idreesia-common/server/schemas/hr';

class KarkunDuties extends AggregatableCollection {
  constructor(name = 'hr-karkun-duties', options = {}) {
    super(name, options);
    this.attachSchema(KarkunDutySchema);
  }
}

export default new KarkunDuties();
