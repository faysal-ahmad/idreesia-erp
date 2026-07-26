// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';

import {
  Attendances,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 15,
  async up() {
    const attendances = Attendances.rawCollection();
    await attendances.createIndex({ karkunId: 1 }, { background: false });
    await attendances.createIndex({ dutyId: 1 }, { background: false });
    await attendances.createIndex({ shiftId: 1 }, { background: false });
    await attendances.createIndex({ jobId: 1 }, { background: false });
    await attendances.createIndex({ month: 1 }, { background: false });
    await attendances.createIndex({ meetingCardBarcodeId: 1 }, { background: false });

    const salaries = Salaries.rawCollection();
    await salaries.createIndex({ karkunId: 1 }, { background: false });
    await salaries.createIndex({ jobId: 1 }, { background: false });
    await salaries.createIndex({ month: 1 }, { background: false });
  },
});
