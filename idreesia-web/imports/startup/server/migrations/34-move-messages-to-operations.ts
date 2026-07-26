import { Migrations } from 'meteor/percolate:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 34,
  async up() {
    const users = await Users.find({}).fetchAsync();
    for (const user of users) {
      const { permissions } = user;
      if (permissions) {
        const updatedPermissions = permissions.map((permission: string) =>
          permission.replace('communication', 'operations')
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
