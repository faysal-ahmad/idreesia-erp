import { Migrations } from 'meteor/quave:migrations';

import { getSystemUser } from 'meteor/idreesia-common/server/business-logic/jobs/system-user';
import {
  backfillEmploymentHistory,
  ensureEmploymentIndexes,
} from 'meteor/idreesia-common/server/business-logic/hr-employees/employment-backfill';

Migrations.add({
  version: 9,
  name: 'Create job shifts and employment history',
  async up() {
    await ensureEmploymentIndexes();
    const count = await backfillEmploymentHistory(await getSystemUser());
    // eslint-disable-next-line no-console
    console.log(`Backfilled employment history for ${count} people.`);
  },
});
