import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { City as CitySchema } from 'meteor/idreesia-common/server/schemas/outstation';

class Cities extends AggregatableCollection {
  constructor(name = 'outstation-cities', options = {}) {
    const cities = super(name, options);
    cities.attachSchema(CitySchema);
    return cities;
  }
}

export default new Cities();
