import { Migrations } from 'meteor/percolate:migrations';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 27,
  up() {
    const visitors = Visitors.rawCollection();
    visitors.createIndex({ karkunId: 1 }, { background: true });
    visitors.createIndex({ dataSource: 1 }, { background: true });

    Visitors.update(
      {
        dataSource: { $exists: false },
      },
      {
        $set: {
          dataSource: 'security',
        },
      },
      { multi: true }
    );
  },
});
