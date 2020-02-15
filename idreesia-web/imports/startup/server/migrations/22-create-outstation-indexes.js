import { Migrations } from 'meteor/percolate:migrations';

import {
  AmaanatLogs,
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 22,
  up() {
    const cities = Cities.rawCollection();
    cities.createIndex({ region: 1 }, { background: true });
    cities.createIndex({ country: 1 }, { background: true });

    const cityMehfils = CityMehfils.rawCollection();
    cityMehfils.createIndex({ cityId: 1 }, { background: true });

    const amaanatLogs = AmaanatLogs.rawCollection();
    amaanatLogs.createIndex({ cityId: 1 }, { background: true });
    amaanatLogs.createIndex({ cityMehfilId: 1 }, { background: true });
    amaanatLogs.createIndex({ sentDate: 1 }, { background: true });
  },
});
