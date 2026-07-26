// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';

import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 22,
  async up() {
    const cities = Cities.rawCollection();
    await cities.createIndex({ region: 1 }, { background: true });
    await cities.createIndex({ country: 1 }, { background: true });

    const cityMehfils = CityMehfils.rawCollection();
    await cityMehfils.createIndex({ cityId: 1 }, { background: true });

    /*
    Legacy accounts-amaanat-logs indexes are intentionally skipped for now
    because the collection has been removed from the active app.
    */
  },
});
