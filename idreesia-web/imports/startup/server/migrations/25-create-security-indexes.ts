import { Migrations } from 'meteor/quave:migrations';

// Visitors collection has since been dropped - see migration 59.
// import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 25,
  async up() {
    // Visitors collection has since been dropped.
    // const visitors = Visitors.rawCollection();
    // await visitors.createIndex({ ehadDate: 1 }, { background: true });
  },
});
