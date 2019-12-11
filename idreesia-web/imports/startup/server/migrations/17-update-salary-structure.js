import { Migrations } from 'meteor/percolate:migrations';

import { Salaries } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 17,
  up() {
    Salaries.update(
      {},
      {
        $set: {
          rashanMadad: 0,
        },
      },
      { multi: true }
    );
  },
});
