import { Mongo } from 'meteor/mongo';

import { OrgLocation as OrgLocationSchema } from 'meteor/idreesia-common/server/schemas/admin';

class OrgLocations extends Mongo.Collection {
  constructor(name = 'common-org-locations', options = {}) {
    const orgLocations = super(name, options);
    orgLocations.attachSchema(OrgLocationSchema);
    return orgLocations;
  }
}

export default new OrgLocations();
