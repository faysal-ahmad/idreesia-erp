import { Migrations } from 'meteor/quave:migrations';

// VisitorMulakaats collection has since been dropped - see migration 59.
// import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 24,
  async up() {
    // VisitorMulakaats collection has since been dropped.
    // const visitorMulakaats = VisitorMulakaats.rawCollection();
    // await visitorMulakaats.createIndex({ visitorId: 1 }, { background: true });
    // await visitorMulakaats.createIndex({ mulakaatDate: 1 }, { background: true });
  },
});
