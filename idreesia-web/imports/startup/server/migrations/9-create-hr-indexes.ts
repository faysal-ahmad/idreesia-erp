import { Migrations } from 'meteor/quave:migrations';

import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 9,
  async up() {
    const karkuns = Karkuns.rawCollection();
    await karkuns.createIndex({ city: 1 }, { background: true });
  },
});
