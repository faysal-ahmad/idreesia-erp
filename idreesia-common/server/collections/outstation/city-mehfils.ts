import { Mongo } from 'meteor/mongo';

import { CityMehfil as CityMehfilSchema } from 'meteor/idreesia-common/server/schemas/outstation';

class CityMehfils extends Mongo.Collection {
  constructor(name = 'outstation-city-mehfils', options = {}) {
    super(name, options);
    this.attachSchema(CityMehfilSchema);
  }
}

export default new CityMehfils();
