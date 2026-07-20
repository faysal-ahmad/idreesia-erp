import { Migrations } from 'meteor/percolate:migrations';

import {
  AmaanatLogs,
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

    const amaanatLogs = AmaanatLogs.rawCollection();
    await amaanatLogs.createIndex({ cityId: 1 }, { background: true });
    await amaanatLogs.createIndex({ cityMehfilId: 1 }, { background: true });
    await amaanatLogs.createIndex({ sentDate: 1 }, { background: true });
  },
});
