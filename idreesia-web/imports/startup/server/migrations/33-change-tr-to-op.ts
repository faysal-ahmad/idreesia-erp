import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
// ImdadRequests collection has since been dropped - see migration 44.
// import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
// Visitors collection has since been dropped - see migration 59.
// import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 33,
  async up() {
    // ImdadRequests collection has since been dropped.
    // await ImdadRequests.updateAsync(
    //   {
    //     dataSource: 'telephone-room',
    //   },
    //   {
    //     $set: {
    //       dataSource: 'operations',
    //     },
    //   },
    //   { multi: true }
    // );

    // Visitors collection has since been dropped.
    // await Visitors.updateAsync(
    //   {
    //     dataSource: 'telephone-room',
    //   },
    //   {
    //     $set: {
    //       dataSource: 'operations',
    //     },
    //   },
    //   { multi: true }
    // );

    const users = await Users.find({}).fetchAsync();
    for (const user of users) {
      const { permissions } = user;
      if (permissions) {
        const updatedPermissions = permissions.map((permission: string) =>
          permission.replace('telephone-room', 'operations')
        );
        await Users.updateAsync(user._id, {
          $set: {
            permissions: updatedPermissions,
          },
        });
      }
    }
  },
});
