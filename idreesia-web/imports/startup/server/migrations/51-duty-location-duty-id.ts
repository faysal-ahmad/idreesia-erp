import { Migrations } from 'meteor/quave:migrations';
import { Random } from 'meteor/random';

import { DutyLocations } from 'meteor/idreesia-common/server/collections/hr';

import { LegacyKarkunDuties } from './legacy-karkun-duties';

// Duty locations used to be a global list. Attach each one to the duty that
// already uses it. A location shared by more than one duty is copied so each
// duty gets its own location, and those karkun duties point at the copy.
Migrations.add({
  version: 51,
  async up() {
    const locations = DutyLocations.rawCollection();
    const karkunDuties = LegacyKarkunDuties.rawCollection();
    await locations.createIndex({ dutyId: 1 }, { background: false });

    const existing = await locations
      .find({ dutyId: { $exists: false } })
      .toArray();

    for (const location of existing) {
      const dutyRows = await karkunDuties
        .aggregate([
          {
            $match: {
              locationId: location._id,
              dutyId: { $type: 'string', $ne: '' },
            },
          },
          { $group: { _id: '$dutyId' } },
        ])
        .toArray();
      const dutyIds = dutyRows
        .map(row => row._id)
        .filter((dutyId): dutyId is string => typeof dutyId === 'string');

      if (dutyIds.length === 0) continue;

      const [firstDutyId, ...otherDutyIds] = dutyIds;
      await locations.updateOne(
        { _id: location._id },
        { $set: { dutyId: firstDutyId } }
      );

      for (const dutyId of otherDutyIds) {
        const newId = Random.id();
        const now = new Date();
        await locations.insertOne({
          _id: newId,
          name: location.name,
          dutyId,
          createdAt: location.createdAt ?? now,
          createdBy: location.createdBy,
          updatedAt: now,
          updatedBy: location.updatedBy,
        });
        await karkunDuties.updateMany(
          { locationId: location._id, dutyId },
          { $set: { locationId: newId } }
        );
      }
    }
  },
});
