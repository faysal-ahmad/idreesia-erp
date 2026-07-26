import { Migrations } from 'meteor/percolate:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 33,
  async up() {
    await ImdadRequests.updateAsync(
      {
        dataSource: 'telephone-room',
      },
      {
        $set: {
          dataSource: 'operations',
        },
      },
      { multi: true }
    );

    await Visitors.updateAsync(
      {
        dataSource: 'telephone-room',
      },
      {
        $set: {
          dataSource: 'operations',
        },
      },
      { multi: true }
    );

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
