import { Migrations } from 'meteor/percolate:migrations';

import { MehfilKarkuns } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 18,
  up() {
    const mehfilKarkuns = MehfilKarkuns.rawCollection();
    mehfilKarkuns.createIndex({ mehfilId: 1 }, { background: true });
    mehfilKarkuns.createIndex({ karkunId: 1 }, { background: true });
    mehfilKarkuns.createIndex({ dutyName: 1 }, { background: true });
    mehfilKarkuns.createIndex({ dutyCardBarcodeId: 1 }, { background: true });
  },
});
