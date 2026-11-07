import { Migrations } from 'meteor/quave:migrations';

// Visitors collection has since been dropped - see migration 59.
// import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 36,
  async up() {
    // Visitors collection has since been dropped.
    // Rename the address field to current address in visitors
    // await Visitors.updateAsync(
    //   {},
    //   {
    //     $rename: { address: 'currentAddress' },
    //   },
    //   { multi: true }
    // );
  },
});
