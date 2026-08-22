import { Migrations } from 'meteor/quave:migrations';

import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 16,
  async up() {
    const visitorStays = VisitorStays.rawCollection();
    await visitorStays.createIndex({ teamName: 1 }, { background: true });
  },
});
