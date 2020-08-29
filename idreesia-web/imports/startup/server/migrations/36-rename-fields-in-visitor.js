import { Migrations } from 'meteor/percolate:migrations';

import { Visitors } from 'meteor/idreesia-common/server/collections/security';

Migrations.add({
  version: 36,
  up() {
    // Rename the address field to current address in visitors
    Visitors.update(
      {},
      {
        $rename: { address: 'currentAddress' },
      },
      { multi: true }
    );
  },
});
