import { Duties, Teams } from 'meteor/idreesia-common/server/collections/hr';
import {
  DAYS_OF_WEEK,
  isDayOfWeek,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-roster-dates';
import { ensureKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/ensure-karkuns';
import {
  ensurePastSnapshotsForTeam,
  teamIsAssignedOnRoster,
} from 'meteor/idreesia-common/server/business-logic/hr/duty-rosters';

interface MemberSchedule {
  karkunId: string;
  daysOfWeek: string[];
}

interface TeamRecord {
  karkunIds?: string[];
  coordinatorKarkunIds?: string[];
  memberSchedules?: MemberSchedule[];
}

const normalizeDaysOfWeek = (
  daysOfWeek: Array<string | null> | null | undefined
) => {
  const selected = new Set<string>();
  for (const day of daysOfWeek ?? []) {
    if (!day || !isDayOfWeek(day)) {
      throw new Error('Please select valid days.');
    }
    selected.add(day);
  }
  if (selected.size === 0) {
    throw new Error('Please select at least one day.');
  }
  return DAYS_OF_WEEK.filter(day => selected.has(day));
};

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const ensureCoordinatorsAreMembers = (
  karkunIds: string[],
  coordinatorKarkunIds: string[]
) => {
  const nonMemberCoordinatorId = coordinatorKarkunIds.find(
    coordinatorKarkunId => !karkunIds.includes(coordinatorKarkunId)
  );
  if (nonMemberCoordinatorId) {
    throw new Error('Coordinators must be members of the team.');
  }
};

const ensureDuty = async (dutyId: string | null | undefined) => {
  if (!dutyId) {
    throw new Error('Please select a duty for the team.');
  }
  const duty = await Duties.findOneAsync(dutyId);
  if (!duty || duty.isMehfilDuty) {
    throw new Error('Please select a valid duty.');
  }
};

const ensureDutyChangeIsAllowed = async (
  teamId: string,
  nextDutyId: string
) => {
  const existingTeam = await Teams.findOneAsync(teamId);
  if (!existingTeam) throw new Error('Team not found.');
  if (existingTeam.dutyId === nextDutyId) return existingTeam;
  if (await teamIsAssignedOnRoster(teamId)) {
    throw new Error(
      'This team is assigned on a duty roster, so its duty cannot be changed.'
    );
  }
  return existingTeam;
};

const resolvers: ResolverMap = {
  TeamType: {
    members: async (team, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        team.karkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
    coordinators: async (team, args, { loaders }) => {
      const people = await loaders.common.people.loadMany(
        team.coordinatorKarkunIds || []
      );
      return people.filter(
        (person: unknown) => person && !(person instanceof Error)
      );
    },
    duty: async team => {
      if (!team.dutyId) return null;
      return Duties.findOneAsync(team.dutyId);
    },
  },

  Query: {
    allTeams: async () => Teams.find({}).fetchAsync(),
    teamById: async (obj, { id }) => Teams.findOneAsync(id),
  },

  Mutation: {
    createTeam: async (
      obj,
      { name, color, description, dutyId, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      const memberKarkunIds = karkunIds ?? [];
      const memberCoordinatorKarkunIds = coordinatorKarkunIds ?? [];
      ensureCoordinatorsAreMembers(memberKarkunIds, memberCoordinatorKarkunIds);
      await ensureKarkuns([
        ...memberKarkunIds,
        ...memberCoordinatorKarkunIds,
      ]);
      await ensureDuty(dutyId);

      const date = new Date();
      const teamId = await Teams.insertAsync({
        name,
        color,
        description,
        dutyId,
        karkunIds: memberKarkunIds,
        coordinatorKarkunIds: memberCoordinatorKarkunIds,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Teams.findOneAsync(teamId);
    },

    updateTeam: async (
      obj,
      { id, name, color, description, dutyId, karkunIds, coordinatorKarkunIds },
      { user }
    ) => {
      await ensureDuty(dutyId);
      const existingTeam = await ensureDutyChangeIsAllowed(id, dutyId);

      const setFields: Record<string, unknown> = {
        name,
        color,
        description,
        dutyId,
        updatedAt: new Date(),
        updatedBy: user._id,
      };

      // karkunIds/coordinatorKarkunIds are managed separately (from the
      // list page); only touch them here when this call actually sends
      // them, so a plain details save doesn't wipe out existing members.
      if (karkunIds !== undefined || coordinatorKarkunIds !== undefined) {
        await ensurePastSnapshotsForTeam(id);
        const effectiveKarkunIds = karkunIds ?? existingTeam?.karkunIds ?? [];
        const effectiveCoordinatorKarkunIds =
          coordinatorKarkunIds ?? existingTeam?.coordinatorKarkunIds ?? [];
        ensureCoordinatorsAreMembers(
          effectiveKarkunIds,
          effectiveCoordinatorKarkunIds
        );
        await ensureKarkuns([
          ...(karkunIds ?? []),
          ...(coordinatorKarkunIds ?? []),
        ]);

        if (karkunIds !== undefined) {
          setFields.karkunIds = karkunIds;
          setFields.memberSchedules = (
            (existingTeam as TeamRecord | undefined)?.memberSchedules ?? []
          ).filter(schedule =>
            (karkunIds as string[]).includes(schedule.karkunId)
          );
        }
        if (coordinatorKarkunIds !== undefined) {
          setFields.coordinatorKarkunIds = coordinatorKarkunIds;
        }
      }

      await Teams.updateAsync(id, { $set: setFields });

      return Teams.findOneAsync(id);
    },

    removeTeam: async (obj, { _id }) => {
      if (await teamIsAssignedOnRoster(_id)) {
        throw new Error(
          'This team is assigned on a duty roster and cannot be deleted.'
        );
      }
      return Teams.removeAsync(_id);
    },

    addTeamMember: async (obj, { teamId, karkunId, daysOfWeek }) => {
      const team = (await Teams.findOneAsync(teamId)) as TeamRecord | undefined;
      if (!team) throw new Error('Team not found.');
      if ((team.karkunIds ?? []).includes(karkunId)) {
        throw new Error('This person is already a member of the team.');
      }
      await ensureKarkuns([karkunId]);

      const days = normalizeDaysOfWeek(daysOfWeek);
      await ensurePastSnapshotsForTeam(teamId);
      await Teams.updateAsync(teamId, {
        $addToSet: { karkunIds: karkunId },
        $push: { memberSchedules: { karkunId, daysOfWeek: days } },
      });

      return Teams.findOneAsync(teamId);
    },

    updateTeamMemberDays: async (obj, { teamId, karkunId, daysOfWeek }) => {
      const team = (await Teams.findOneAsync(teamId)) as TeamRecord | undefined;
      if (!team) throw new Error('Team not found.');
      if (!(team.karkunIds ?? []).includes(karkunId)) {
        throw new Error('This person is not a member of the team.');
      }

      const days = normalizeDaysOfWeek(daysOfWeek);
      await ensurePastSnapshotsForTeam(teamId);
      const memberSchedules = (team.memberSchedules ?? []).filter(
        schedule => schedule.karkunId !== karkunId
      );
      memberSchedules.push({ karkunId, daysOfWeek: days });
      await Teams.updateAsync(teamId, {
        $set: { memberSchedules },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamMember: async (obj, { teamId, karkunId }) => {
      await ensurePastSnapshotsForTeam(teamId);
      const team = (await Teams.findOneAsync(teamId)) as TeamRecord | undefined;
      if (!team) throw new Error('Team not found.');
      // A karkun can't remain a coordinator once they're no longer a member.
      await Teams.updateAsync(teamId, {
        $pull: { karkunIds: karkunId, coordinatorKarkunIds: karkunId },
        $set: {
          memberSchedules: (team.memberSchedules ?? []).filter(
            schedule => schedule.karkunId !== karkunId
          ),
        },
      });

      return Teams.findOneAsync(teamId);
    },

    addTeamCoordinator: async (obj, { teamId, karkunId }) => {
      const team = (await Teams.findOneAsync(teamId)) as TeamRecord | undefined;
      ensureCoordinatorsAreMembers(team?.karkunIds ?? [], [karkunId]);
      await ensureKarkuns([karkunId]);

      await Teams.updateAsync(teamId, {
        $addToSet: { coordinatorKarkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },

    removeTeamCoordinator: async (obj, { teamId, karkunId }) => {
      await Teams.updateAsync(teamId, {
        $pull: { coordinatorKarkunIds: karkunId },
      });

      return Teams.findOneAsync(teamId);
    },
  },
};

export default resolvers;
