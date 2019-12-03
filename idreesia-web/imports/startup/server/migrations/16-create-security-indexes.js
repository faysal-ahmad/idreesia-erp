import { Migrations } from 'meteor/percolate:migrations';

import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 16,
  up() {
    const visitorStays = VisitorStays.rawCollection();
    visitorStays.createIndex({ teamName: 1 }, { background: true });
  },
});
