// @ts-nocheck
import { Migrations } from 'meteor/percolate:migrations';

import {
  Karkuns,
  KarkunDuties,
} from 'meteor/idreesia-common/server/collections/hr';

Migrations.add({
  version: 13,
  async up() {
    const karkuns = Karkuns.rawCollection();
    await karkuns.createIndex({ cnicNumber: 1 }, { background: false });
    await karkuns.createIndex({ contactNumber1: 1 }, { background: false });
    await karkuns.createIndex({ contactNumber2: 1 }, { background: false });
    await karkuns.createIndex({ bloodGroup: 1 }, { background: false });
    // karkuns.createIndex({ sharedResidenceId: 1 }, { background: false });
    await karkuns.createIndex({ isEmployee: 1 }, { background: false });
    await karkuns.createIndex({ jobId: 1 }, { background: false });
    await karkuns.createIndex({ employmentStartDate: 1 }, { background: false });
    await karkuns.createIndex({ employmentEndDate: 1 }, { background: false });

    const karkunDuties = KarkunDuties.rawCollection();
    await karkunDuties.createIndex({ karkunId: 1 }, { background: false });
    await karkunDuties.createIndex({ dutyId: 1 }, { background: false });
    await karkunDuties.createIndex({ shiftId: 1 }, { background: false });

    // const sharedResidencies = SharedResidences.rawCollection();
    // sharedResidencies.createIndex({ address: 'text' });
    // sharedResidencies.createIndex({ ownerKarkunId: 1 }, { background: false });
  },
});
