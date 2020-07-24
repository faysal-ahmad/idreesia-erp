import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { SharedResidenceResident as SharedResidenceResidentSchema } from 'meteor/idreesia-common/server/schemas/security';

class SharedResidenceResidents extends AggregatableCollection {
  constructor(name = 'security-shared-residence-residents', options = {}) {
    const sharedResidenceResidents = super(name, options);
    sharedResidenceResidents.attachSchema(SharedResidenceResidentSchema);
    return sharedResidenceResidents;
  }
}

export default new SharedResidenceResidents();
