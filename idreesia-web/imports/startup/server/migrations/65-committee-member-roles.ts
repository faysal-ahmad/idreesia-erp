import { Migrations } from 'meteor/quave:migrations';

import { Committees } from 'meteor/idreesia-common/server/collections/hr';

interface LegacyMember {
  karkunId: string;
  isCoordinator?: boolean;
  role?: string;
}

// Committee members kept an isCoordinator flag. Replace it with a role string
// (member, coordinator, guest or observer).
Migrations.add({
  version: 65,
  async up() {
    const committees = (await Committees.find({
      'members.0': { $exists: true },
    }).fetchAsync()) as unknown as Array<{
      _id: string;
      members: LegacyMember[];
    }>;

    for (const committee of committees) {
      const members = committee.members.map(({ karkunId, isCoordinator, role }) => ({
        karkunId,
        role: role ?? (isCoordinator ? 'coordinator' : 'member'),
      }));
      await Committees.updateAsync(
        committee._id,
        { $set: { members } },
        { bypassCollection2: true }
      );
    }
  },
});
