import { Mongo } from 'meteor/mongo';

import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/outstation';

class Cities extends Mongo.Collection {
  constructor(name = 'outstation-cities', options = {}) {
    const cities = super(name, options);
    cities.attachSchema(CitySchema);
    return cities;
  }
}

export default new Cities();
