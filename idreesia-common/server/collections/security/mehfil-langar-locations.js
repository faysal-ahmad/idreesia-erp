import { Mongo } from 'meteor/mongo';

import { MehfilLangarLocation as MehfilLangarLocationSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarLocations extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-locations', options = {}) {
    const mehfilLangarLocations = super(name, options);
    mehfilLangarLocations.attachSchema(MehfilLangarLocationSchema);
    return mehfilLangarLocations;
  }
}

export default new MehfilLangarLocations();
