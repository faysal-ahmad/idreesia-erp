import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SharedResidence as SharedResidenceSchema } from 'meteor/idreesia-common/server/schemas/security';

class SharedResidences extends AggregatableCollection {
  constructor(name = 'security-shared-residences', options = {}) {
    const sharedResidences = super(name, options);
    sharedResidences.attachSchema(SharedResidenceSchema);
    return sharedResidences;
  }
}

export default new SharedResidences();
