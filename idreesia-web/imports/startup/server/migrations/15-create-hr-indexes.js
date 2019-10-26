import { Migrations } from 'meteor/percolate:migrations';

import {
  Attendances,
  Salaries,
} from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 15,
  up() {
    const attendances = Attendances.rawCollection();
    attendances.createIndex({ karkunId: 1 }, { background: false });
    attendances.createIndex({ dutyId: 1 }, { background: false });
    attendances.createIndex({ shiftId: 1 }, { background: false });
    attendances.createIndex({ jobId: 1 }, { background: false });
    attendances.createIndex({ month: 1 }, { background: false });
    attendances.createIndex({ meetingCardBarcodeId: 1 }, { background: false });

    const salaries = Salaries.rawCollection();
    salaries.createIndex({ karkunId: 1 }, { background: false });
    salaries.createIndex({ jobId: 1 }, { background: false });
    salaries.createIndex({ month: 1 }, { background: false });
  },
});
