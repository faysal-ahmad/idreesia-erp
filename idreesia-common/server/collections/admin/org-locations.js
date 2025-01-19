import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { OrgLocation as OrgLocationSchema } from 'meteor/idreesia-common/server/schemas/admin';

class OrgLocations extends AggregatableCollection {
  constructor(name = 'admin-org-locations', options = {}) {
    const orgLocations = super(name, options);
    orgLocations.attachSchema(OrgLocationSchema);
    return orgLocations;
  }
}

export default new OrgLocations();
