import { Migrations } from 'meteor/quave:migrations';

import { Users } from 'meteor/idreesia-common/server/collections/admin';

Migrations.add({
  version: 57,
  async up() {
    // Discussions map each message's chat sender back to the ERP user (and
    // from there to the person's profile image) by chatUserId. Only users
    // with a chat account have the field, hence sparse.
    await Users.rawCollection().createIndex(
      { chatUserId: 1 },
      { background: true, sparse: true }
    );
  },
});
