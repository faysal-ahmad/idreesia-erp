import { Migrations } from 'meteor/percolate:migrations';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';

Migrations.add({
  version: 23,
  up() {
    const messages = Messages.rawCollection();
    messages.createIndex({ source: 1 }, { background: true });
    messages.createIndex({ status: 1 }, { background: true });
    messages.createIndex({ sentDate: 1 }, { background: true });
    messages.createIndex({ karkunIds: 1 }, { background: true });
    messages.createIndex({ visitorIds: 1 }, { background: true });
  },
});
