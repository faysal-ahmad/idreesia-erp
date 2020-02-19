import { Migrations } from 'meteor/percolate:migrations';

import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 24,
  up() {
    const visitorMulakaats = VisitorMulakaats.rawCollection();
    visitorMulakaats.createIndex({ visitorId: 1 }, { background: true });
    visitorMulakaats.createIndex({ mulakaatDate: 1 }, { background: true });
  },
});
