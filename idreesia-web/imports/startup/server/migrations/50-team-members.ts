import { Migrations } from 'meteor/quave:migrations';

import { Teams } from 'meteor/idreesia-common/server/collections/hr';

interface LegacyTeam {
  _id: string;
  karkunIds?: string[] | null;
  coordinatorKarkunId?: string | null;
  coordinatorKarkunIds?: string[] | null;
  memberSchedules?: Array<{
    karkunId?: string | null;
    daysOfWeek?: string[] | null;
  }> | null;
}

interface TeamMember {
  karkunId: string;
  isCoordinator?: boolean;
  daysOfWeek?: string[];
}

// Teams kept members, coordinators and member days in three separate arrays.
// Merge them into one members array of { karkunId, isCoordinator, daysOfWeek }.
// Handles both the single coordinatorKarkunId field and the newer
// coordinatorKarkunIds array. A coordinator who was not listed as a member is
// kept as a member.
Migrations.add({
  version: 50,
  async up() {
    await Teams.rawCollection().createIndex({ 'members.karkunId': 1 });

    const teams = (await Teams.find({
      $or: [
        { karkunIds: { $exists: true } },
        { coordinatorKarkunId: { $exists: true } },
        { coordinatorKarkunIds: { $exists: true } },
        { memberSchedules: { $exists: true } },
      ],
    }).fetchAsync()) as unknown as LegacyTeam[];

    for (const team of teams) {
      const coordinatorIds = new Set(
        [team.coordinatorKarkunId, ...(team.coordinatorKarkunIds ?? [])].filter(
          (id): id is string => !!id
        )
      );
      const daysByKarkun = new Map<string, string[]>();
      (team.memberSchedules ?? []).forEach(schedule => {
        if (schedule?.karkunId && schedule.daysOfWeek?.length) {
          daysByKarkun.set(schedule.karkunId, schedule.daysOfWeek);
        }
      });

      const memberIds = [
        ...new Set(
          [...(team.karkunIds ?? []), ...coordinatorIds].filter(
            (id): id is string => !!id
          )
        ),
      ];
      const members = memberIds.map(karkunId => {
        const member: TeamMember = { karkunId };
        if (coordinatorIds.has(karkunId)) member.isCoordinator = true;
        const days = daysByKarkun.get(karkunId);
        if (days) member.daysOfWeek = days;
        return member;
      });

      await Teams.updateAsync(
        team._id,
        {
          $set: { members },
          $unset: {
            karkunIds: '',
            coordinatorKarkunId: '',
            coordinatorKarkunIds: '',
            memberSchedules: '',
          },
        },
        { bypassCollection2: true }
      );
    }
  },
});
