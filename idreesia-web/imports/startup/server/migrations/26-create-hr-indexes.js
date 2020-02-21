import { Migrations } from 'meteor/percolate:migrations';

import { Kakrkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 26,
  up() {
    const karkuns = Kakrkuns.rawCollection();
    karkuns.createIndex({ ehadDate: 1 }, { background: true });
    karkuns.createIndex({ lastTarteebDate: 1 }, { background: true });
  },
});
