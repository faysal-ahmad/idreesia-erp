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
    karkuns.createIndex({ cnicNumber: 1 }, { background: false });
    karkuns.createIndex({ contactNumber1: 1 }, { background: false });
    karkuns.createIndex({ contactNumber2: 1 }, { background: false });
    karkuns.createIndex({ bloodGroup: 1 }, { background: false });
    karkuns.createIndex({ sharedResidenceId: 1 }, { background: false });
    karkuns.createIndex({ isEmployee: 1 }, { background: false });
    karkuns.createIndex({ jobId: 1 }, { background: false });
    karkuns.createIndex({ employmentStartDate: 1 }, { background: false });
    karkuns.createIndex({ employmentEndDate: 1 }, { background: false });

    const karkunDuties = KarkunDuties.rawCollection();
    karkunDuties.createIndex({ karkunId: 1 }, { background: false });
    karkunDuties.createIndex({ dutyId: 1 }, { background: false });
    karkunDuties.createIndex({ shiftId: 1 }, { background: false });

    const sharedResidencies = SharedResidences.rawCollection();
    sharedResidencies.createIndex({ address: 'text' });
    sharedResidencies.createIndex({ ownerKarkunId: 1 }, { background: false });
  },
});
