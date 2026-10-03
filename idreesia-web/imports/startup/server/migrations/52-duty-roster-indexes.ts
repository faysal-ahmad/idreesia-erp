import { Migrations } from 'meteor/quave:migrations';

import { ensureDutyRosterIndexes } from 'meteor/idreesia-common/server/business-logic/hr/duty-rosters';

Migrations.add({
  version: 52,
  async up() {
    await ensureDutyRosterIndexes();
  },
});
