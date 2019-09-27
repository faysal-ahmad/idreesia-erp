import { Mongo } from 'meteor/mongo';

import { Configuration as ConfigurationSchema } from 'meteor/idreesia-common/server/schemas/common';

class Configurations extends Mongo.Collection {
  constructor(name = 'common-configurations', options = {}) {
    const configurations = super(name, options);
    configurations.attachSchema(ConfigurationSchema);
    return configurations;
  }
}

export default new Configurations();
