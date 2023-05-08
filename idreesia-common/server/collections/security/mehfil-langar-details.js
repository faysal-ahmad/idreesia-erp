import { Mongo } from 'meteor/mongo';

import { MehfilLangarDetail as MehfilLangarDetailSchema } from 'meteor/idreesia-common/server/schemas/security';

class MehfilLangarDetails extends Mongo.Collection {
  constructor(name = 'security-mehfil-langar-details', options = {}) {
    const mehfilLangarDetails = super(name, options);
    mehfilLangarDetails.attachSchema(MehfilLangarDetailSchema);
    return mehfilLangarDetails;
  }
}

export default new MehfilLangarDetails();
