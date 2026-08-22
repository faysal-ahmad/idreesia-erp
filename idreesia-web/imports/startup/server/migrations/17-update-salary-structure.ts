import { Migrations } from 'meteor/quave:migrations';

import { Salaries } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 17,
  async up() {
    await Salaries.updateAsync(
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
