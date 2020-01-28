import { Mongo } from 'meteor/mongo';

import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/hr';

class Cities extends Mongo.Collection {
  constructor(name = 'hr-cities', options = {}) {
    const cities = super(name, options);
    cities.attachSchema(CitySchema);
    return cities;
  }
}

export default new Cities();
