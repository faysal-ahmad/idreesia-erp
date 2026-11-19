import { Migrations } from 'meteor/quave:migrations';

import { ensureDutiesAttendanceIndexes } from 'meteor/idreesia-common/server/business-logic/duties-attendance';

Migrations.add({
  version: 71,
  async up() {
    await ensureDutiesAttendanceIndexes();
  },
});
