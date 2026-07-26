import { Mongo } from 'meteor/mongo';

import { MehfilLangarLocation as MehfilLangarLocationSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarLocations extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-locations', options = {}) {
    super(name, options);
    this.attachSchema(MehfilLangarLocationSchema);
  }
}

export default new MehfilLangarLocations();
