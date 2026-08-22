import { Migrations } from 'meteor/quave:migrations';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 25,
  async up() {
    const visitors = Visitors.rawCollection();
    await visitors.createIndex({ ehadDate: 1 }, { background: true });
  },
});
