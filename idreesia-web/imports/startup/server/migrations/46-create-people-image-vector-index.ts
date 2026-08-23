import { Migrations } from 'meteor/quave:migrations';

import { People } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 46,
  async up() {
    const people = People.rawCollection();
    await people.createIndex(
      {
        'sharedData.imageVectorData.status': 1,
        'sharedData.imageVectorData.computedAt': 1,
      },
      { background: true }
    );
  },
});
