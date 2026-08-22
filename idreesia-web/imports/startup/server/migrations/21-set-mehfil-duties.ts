import { Migrations } from 'meteor/quave:migrations';

import { Duties } from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 21,
  async up() {
    await Duties.updateAsync(
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
