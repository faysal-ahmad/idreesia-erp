import { Migrations } from 'meteor/percolate:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 26,
  async up() {
    const karkuns = Karkuns.rawCollection();
    await karkuns.createIndex({ ehadDate: 1 }, { background: true });
    await karkuns.createIndex({ lastTarteebDate: 1 }, { background: true });
  },
});
