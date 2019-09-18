import { AggregatableCollection } from 'meteor/idreesia-common/collections';
import { SharedResidence as SharedResidenceSchema } from 'meteor/idreesia-common/schemas/hr';

class SharedResidences extends AggregatableCollection {
  constructor(name = 'hr-shared-residences', options = {}) {
    const sharedResidences = super(name, options);
    sharedResidences.attachSchema(SharedResidenceSchema);
    return sharedResidences;
  }
}

export default new SharedResidences();
