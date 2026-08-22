import { Migrations } from 'meteor/quave:migrations';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 36,
  async up() {
    // Rename the address field to current address in visitors
    await Visitors.updateAsync(
      {},
      {
        $rename: { address: 'currentAddress' },
      },
      { multi: true }
    );
  },
});
