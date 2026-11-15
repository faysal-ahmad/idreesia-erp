import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 67,
  async up() {
    // Super-admin rights used to be tied to the 'erp-admin' user name. They
    // are now an isSuperAdmin flag that any user can be given. Flag erp-admin
    // so it keeps its access and can grant the flag to others before it is
    // retired.
    await Users.updateAsync(
      { username: 'erp-admin' },
      { $set: { isSuperAdmin: true } }
    );
  },
});
