import { Mongo } from 'meteor/mongo';

import { ImdadReason as ImdadReasonSchema } from 'meteor/idreesia-common/server/schemas/imdad';

class ImdadReasons extends Mongo.Collection {
  constructor(name = 'imdad-imdad-reasons', options = {}) {
    super(name, options);
    this.attachSchema(ImdadReasonSchema);
  }
}

export default new ImdadReasons();
