import { Migrations } from 'meteor/quave:migrations';

import { Committees, Duties } from 'meteor/idreesia-common/server/collections/hr';

interface LegacyCommittee {
  _id: string;
  karkunIds?: string[] | null;
  coordinatorKarkunIds?: string[] | null;
}

interface CommitteeMember {
  karkunId: string;
  isCoordinator?: boolean;
}

// Committees kept members and coordinators in two separate arrays. Merge them
// into one members array of { karkunId, isCoordinator }, as was done for
// teams in migration 50. A coordinator who was not listed as a member is kept
// as a member. Also indexes the committee responsible for each duty.
Migrations.add({
  version: 53,
  async up() {
    await Committees.rawCollection().createIndex({ 'members.karkunId': 1 });
    await Duties.rawCollection().createIndex({ committeeId: 1 });

    const committees = (await Committees.find({
      $or: [
        { karkunIds: { $exists: true } },
        { coordinatorKarkunIds: { $exists: true } },
      ],
    }).fetchAsync()) as unknown as LegacyCommittee[];

    for (const committee of committees) {
      const coordinatorIds = new Set(
        (committee.coordinatorKarkunIds ?? []).filter(
          (id): id is string => !!id
        )
      );
      const memberIds = [
        ...new Set(
          [...(committee.karkunIds ?? []), ...coordinatorIds].filter(
            (id): id is string => !!id
          )
        ),
      ];
      const members = memberIds.map(karkunId => {
        const member: CommitteeMember = { karkunId };
        if (coordinatorIds.has(karkunId)) member.isCoordinator = true;
        return member;
      });

      await Committees.updateAsync(
        committee._id,
        {
          $set: { members },
          $unset: { karkunIds: '', coordinatorKarkunIds: '' },
        },
        { bypassCollection2: true }
      );
    }
  },
});
