import { Migrations } from 'meteor/percolate:migrations';

import { ImdadRequests } from 'meteor/idreesia-common/server/collections/accounts';

Migrations.add({
  version: 30,
  up() {
    const imdadRequests = ImdadRequests.rawCollection();
    imdadRequests.createIndex({ visitorId: 1 }, { background: true });
    imdadRequests.createIndex({ requestDate: 1 }, { background: true });
    imdadRequests.createIndex({ dataSource: 1 }, { background: true });
    imdadRequests.createIndex({ status: 1 }, { background: true });
    imdadRequests.createIndex({ updatedAt: 1 }, { background: true });
  },
});
