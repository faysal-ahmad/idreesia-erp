import { Mongo } from 'meteor/mongo';

import { Company as CompanySchema } from '../../schemas/accounts';

class Companies extends Mongo.Collection {
  constructor(name = 'accounts-companies', options = {}) {
    const companies = super(name, options);
    companies.attachSchema(CompanySchema);
    return companies;
  }
}

export default new Companies();
