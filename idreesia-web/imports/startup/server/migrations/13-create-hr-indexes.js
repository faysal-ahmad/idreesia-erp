import { Migrations } from 'meteor/percolate:migrations';

import {
  Karkuns,
  KarkunDuties,
  SharedResidences,
} from 'meteor/idreesia-common/collections/hr';

Migrations.add({
  version: 13,
  up() {
    const karkuns = Karkuns.rawCollection();
    karkuns.createIndex({ cnicNumber: 1 }, { background: true });
    karkuns.createIndex({ contactNumber1: 1 }, { background: true });
    karkuns.createIndex({ contactNumber2: 1 }, { background: true });
    karkuns.createIndex({ bloodGroup: 1 }, { background: true });
    karkuns.createIndex({ sharedResidenceId: 1 }, { background: true });
    karkuns.createIndex({ isEmployee: 1 }, { background: true });
    karkuns.createIndex({ jobId: 1 }, { background: true });
    karkuns.createIndex({ employmentStartDate: 1 }, { background: true });
    karkuns.createIndex({ employmentEndDate: 1 }, { background: true });

    const karkunDuties = KarkunDuties.rawCollection();
    karkunDuties.createIndex({ karkunId: 1 }, { background: true });
    karkunDuties.createIndex({ dutyId: 1 }, { background: true });
    karkunDuties.createIndex({ shiftId: 1 }, { background: true });

    const sharedResidencies = SharedResidences.rawCollection();
    sharedResidencies.createIndex({ address: 'text' });
    sharedResidencies.createIndex({ ownerKarkunId: 1 }, { background: true });
  },
});
