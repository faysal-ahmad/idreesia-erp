import { Mongo } from 'meteor/mongo';

import { Company as CompanySchema } from 'meteor/idreesia-common/server/schemas/accounts';

class Companies extends Mongo.Collection {
  constructor(name = 'accounts-companies', options = {}) {
    super(name, options);
    this.attachSchema(CompanySchema);
  }
}

export default new Companies();
