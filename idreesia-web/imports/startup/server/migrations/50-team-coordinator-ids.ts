import { Migrations } from 'meteor/quave:migrations';

import { Teams } from 'meteor/idreesia-common/server/collections/hr';

// Teams used to store a single coordinatorKarkunId. Move that id into
// coordinatorKarkunIds so a team can have more than one coordinator.
Migrations.add({
  version: 50,
  async up() {
    const teams = Teams.rawCollection();
    const existing = await teams
      .find({ coordinatorKarkunId: { $exists: true } })
      .toArray();

    for (const team of existing) {
      const coordinatorKarkunIds = Array.isArray(team.coordinatorKarkunIds)
        ? [...team.coordinatorKarkunIds]
        : [];
      if (
        typeof team.coordinatorKarkunId === 'string' &&
        team.coordinatorKarkunId &&
        !coordinatorKarkunIds.includes(team.coordinatorKarkunId)
      ) {
        coordinatorKarkunIds.push(team.coordinatorKarkunId);
      }

      await teams.updateOne(
        { _id: team._id },
        {
          $set: { coordinatorKarkunIds },
          $unset: { coordinatorKarkunId: '' },
        }
      );
    }
  },
});
