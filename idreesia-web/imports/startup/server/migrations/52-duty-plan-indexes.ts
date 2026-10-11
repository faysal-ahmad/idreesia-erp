import { Migrations } from 'meteor/quave:migrations';

import { ensureDutyPlanIndexes } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

Migrations.add({
  version: 52,
  async up() {
    await ensureDutyPlanIndexes();
  },
});
