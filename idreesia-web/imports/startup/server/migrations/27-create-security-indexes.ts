import { Migrations } from 'meteor/quave:migrations';

// Visitors collection has since been dropped - see migration 59.
// import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 27,
  async up() {
    // Visitors collection has since been dropped.
    // const visitors = Visitors.rawCollection();
    // await visitors.createIndex({ karkunId: 1 }, { background: true });
    // await visitors.createIndex({ dataSource: 1 }, { background: true });

    // await Visitors.updateAsync(
    //   {
    //     dataSource: { $exists: false },
    //   },
    //   {
    //     $set: {
    //       dataSource: 'security',
    //     },
    //   },
    //   { multi: true }
    // );
  },
});
