import { Migrations } from 'meteor/quave:migrations';

Migrations.add({
  version: 13,
  async up() {
    // Karkuns collection has since been removed - its data now lives on People.
    // const karkuns = Karkuns.rawCollection();
    // await karkuns.createIndex({ cnicNumber: 1 }, { background: false });
    // await karkuns.createIndex({ contactNumber1: 1 }, { background: false });
    // await karkuns.createIndex({ contactNumber2: 1 }, { background: false });
    // await karkuns.createIndex({ bloodGroup: 1 }, { background: false });
    // karkuns.createIndex({ sharedResidenceId: 1 }, { background: false });
    // await karkuns.createIndex({ isEmployee: 1 }, { background: false });
    // await karkuns.createIndex({ jobId: 1 }, { background: false });
    // await karkuns.createIndex({ employmentStartDate: 1 }, { background: false });
    // await karkuns.createIndex({ employmentEndDate: 1 }, { background: false });

    // KarkunDuties collection has since been removed (migration 54 drops it).
    // const karkunDuties = KarkunDuties.rawCollection();
    // await karkunDuties.createIndex({ karkunId: 1 }, { background: false });
    // await karkunDuties.createIndex({ dutyId: 1 }, { background: false });
    // await karkunDuties.createIndex({ shiftId: 1 }, { background: false });

    // const sharedResidencies = SharedResidences.rawCollection();
    // sharedResidencies.createIndex({ address: 'text' });
    // sharedResidencies.createIndex({ ownerKarkunId: 1 }, { background: false });
  },
});
