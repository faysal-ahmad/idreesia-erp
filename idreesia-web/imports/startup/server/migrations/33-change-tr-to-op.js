import { Migrations } from 'meteor/percolate:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 33,
  up() {
    ImdadRequests.update(
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

    Visitors.update(
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

    const users = Users.find({}).fetch();
    users.forEach(user => {
      const { permissions } = user;
      if (permissions) {
        const updatedPermissions = permissions.map(permission =>
          permission.replace('telephone-room', 'operations')
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
