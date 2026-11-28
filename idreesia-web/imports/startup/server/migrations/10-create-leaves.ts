import { Migrations } from 'meteor/quave:migrations';

import { getSystemUser } from 'meteor/idreesia-common/server/business-logic/jobs/system-user';
import {
  ensureLeaveIndexes,
  seedDefaultLeaveTypes,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/employment-backfill';
import { splitHrModule } from 'meteor/idreesia-common/server/business-logic/hr-common/split-hr-module';

Migrations.add({
  version: 10,
  name: 'Create leaves; split HR into HR - Karkuns and HR - Employees',
  async up() {
    await ensureLeaveIndexes();
    await seedDefaultLeaveTypes(await getSystemUser());
    const result = await splitHrModule();
    // eslint-disable-next-line no-console
    console.log('Split HR into HR - Karkuns and HR - Employees:', result);
  },
});
