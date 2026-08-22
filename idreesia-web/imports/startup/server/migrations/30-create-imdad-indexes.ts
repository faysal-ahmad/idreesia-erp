import { Migrations } from 'meteor/quave:migrations';

import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';

Migrations.add({
  version: 30,
  async up() {
    const imdadRequests = ImdadRequests.rawCollection();
    await imdadRequests.createIndex({ visitorId: 1 }, { background: true });
    await imdadRequests.createIndex({ requestDate: 1 }, { background: true });
    await imdadRequests.createIndex({ dataSource: 1 }, { background: true });
    await imdadRequests.createIndex({ status: 1 }, { background: true });
    await imdadRequests.createIndex({ updatedAt: 1 }, { background: true });
  },
});
