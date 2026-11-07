import { Migrations } from 'meteor/quave:migrations';
// Messages collection has since been dropped - see migration 59.
// import { Messages } from 'meteor/idreesia-common/server/collections/communication';

Migrations.add({
  version: 23,
  async up() {
    // Messages collection has since been dropped.
    // const messages = Messages.rawCollection();
    // await messages.createIndex({ source: 1 }, { background: true });
    // await messages.createIndex({ status: 1 }, { background: true });
    // await messages.createIndex({ sentDate: 1 }, { background: true });
    // await messages.createIndex({ karkunIds: 1 }, { background: true });
    // await messages.createIndex({ visitorIds: 1 }, { background: true });
  },
});
