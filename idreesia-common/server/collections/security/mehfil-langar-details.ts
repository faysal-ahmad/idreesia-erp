import { Mongo } from 'meteor/mongo';

import { MehfilLangarDetail as MehfilLangarDetailSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarDetails extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-details', options = {}) {
    super(name, options);
    this.attachSchema(MehfilLangarDetailSchema);
  }
}

export default new MehfilLangarDetails();
