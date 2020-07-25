import { Mongo } from 'meteor/mongo';

import { ImdadReason as ImdadReasonSchema } from 'meteor/idreesia-common/server/schemas/imdad';

class ImdadReasons extends Mongo.Collection {
  constructor(name = 'imdad-imdad-reasons', options = {}) {
    const imdadReasons = super(name, options);
    imdadReasons.attachSchema(ImdadReasonSchema);
    return imdadReasons;
  }
}

export default new ImdadReasons();
