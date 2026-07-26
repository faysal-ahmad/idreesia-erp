import { Migrations } from 'meteor/percolate:migrations';

import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 24,
  async up() {
    const visitorMulakaats = VisitorMulakaats.rawCollection();
    await visitorMulakaats.createIndex({ visitorId: 1 }, { background: true });
    await visitorMulakaats.createIndex({ mulakaatDate: 1 }, { background: true });
  },
});
