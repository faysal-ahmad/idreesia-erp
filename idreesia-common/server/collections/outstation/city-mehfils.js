import { Mongo } from 'meteor/mongo';

import { CityMehfil as CityMehfilSchema } from 'meteor/idreesia-common/server/schemas/outstation';

class CityMehfils extends Mongo.Collection {
  constructor(name = 'outstation-city-mehfils', options = {}) {
    const cityMehfils = super(name, options);
    cityMehfils.attachSchema(CityMehfilSchema);
    return cityMehfils;
  }
}

export default new CityMehfils();
