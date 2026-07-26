// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';

Migrations.add({
  version: 23,
  async up() {
    const messages = Messages.rawCollection();
    await messages.createIndex({ source: 1 }, { background: true });
    await messages.createIndex({ status: 1 }, { background: true });
    await messages.createIndex({ sentDate: 1 }, { background: true });
    await messages.createIndex({ karkunIds: 1 }, { background: true });
    await messages.createIndex({ visitorIds: 1 }, { background: true });
  },
});
