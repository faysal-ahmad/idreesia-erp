import { Migrations } from 'meteor/percolate:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 26,
  up() {
    const karkuns = Karkuns.rawCollection();
    karkuns.createIndex({ ehadDate: 1 }, { background: true });
    karkuns.createIndex({ lastTarteebDate: 1 }, { background: true });
  },
});
