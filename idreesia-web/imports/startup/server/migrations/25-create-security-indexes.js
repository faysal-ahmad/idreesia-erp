import { Migrations } from 'meteor/percolate:migrations';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 25,
  up() {
    const visitors = Visitors.rawCollection();
    visitors.createIndex({ ehadDate: 1 }, { background: true });
  },
});
