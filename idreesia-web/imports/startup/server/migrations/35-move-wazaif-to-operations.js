import { Migrations } from 'meteor/percolate:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 35,
  up() {
    const users = Users.find({}).fetch();
    users.forEach(user => {
      const { permissions } = user;
      if (permissions) {
        const updatedPermissions = permissions.map(permission =>
          permission.replace('wazaif-management', 'operations')
        );
        Users.update(user._id, {
          $set: {
            permissions: updatedPermissions,
          },
        });
      }
    });
  },
});
