import { Migrations } from 'meteor/quave:migrations';

import { SecurityEventKarkuns } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 18,
  async up() {
    const mehfilKarkuns = SecurityEventKarkuns.rawCollection();
    await mehfilKarkuns.createIndex({ mehfilId: 1 }, { background: true });
    await mehfilKarkuns.createIndex({ karkunId: 1 }, { background: true });
    await mehfilKarkuns.createIndex({ dutyName: 1 }, { background: true });
    await mehfilKarkuns.createIndex({ dutyCardBarcodeId: 1 }, { background: true });
  },
});
