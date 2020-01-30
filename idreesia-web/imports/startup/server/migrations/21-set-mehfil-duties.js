import { Migrations } from 'meteor/percolate:migrations';

import { Duties } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 21,
  up() {
    Duties.update(
      {},
      {
        $set: {
          isMehfilDuty: false,
        },
      },
      { multi: true }
    );
  },
});
